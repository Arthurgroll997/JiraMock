// =============================================================================
// PipelineRunner — Lädt YAML-Pipelines und führt Steps sequenziell aus
// =============================================================================

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { v4: uuidv4 } = require('uuid');
const StepExecutor = require('./StepExecutor');
const RollbackHandler = require('./RollbackHandler');
const VariableResolver = require('./VariableResolver');

class PipelineRunner {
  /**
   * @param {ConnectorRegistry} registry - Connector-Registry
   */
  constructor(registry) {
    this.registry = registry;
    this.stepExecutor = new StepExecutor(registry);
    this.rollbackHandler = new RollbackHandler(registry);
    this.runs = new Map(); // Run-History
  }

  /**
   * Lädt eine Pipeline-Definition aus einer YAML-Datei
   * @param {string} filePath - Pfad zur YAML-Datei
   * @returns {object} Pipeline-Definition
   */
  loadPipeline(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const pipeline = yaml.load(content);
    this._validatePipeline(pipeline, filePath);
    return pipeline;
  }

  /**
   * Validiert eine Pipeline-Definition
   */
  _validatePipeline(pipeline, source = 'unknown') {
    const errors = [];

    if (!pipeline.name) errors.push('Pipeline benötigt ein "name" Feld');
    if (!pipeline.steps || !Array.isArray(pipeline.steps)) {
      errors.push('Pipeline benötigt ein "steps" Array');
    } else {
      pipeline.steps.forEach((step, i) => {
        if (!step.name) errors.push(`Step ${i + 1}: "name" fehlt`);
        if (!step.system && step.action !== 'wait' && !step.wait) {
          errors.push(`Step ${i + 1} (${step.name || '?'}): "system" fehlt`);
        }
        if (!step.action && !step.wait) {
          errors.push(`Step ${i + 1} (${step.name || '?'}): "action" fehlt`);
        }
      });
    }

    if (pipeline.rollback && !Array.isArray(pipeline.rollback)) {
      errors.push('"rollback" muss ein Array sein');
    }

    if (errors.length > 0) {
      throw new Error(`Pipeline-Validierung fehlgeschlagen (${source}):\n  - ${errors.join('\n  - ')}`);
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validiert eine Pipeline und gibt Ergebnis zurück (ohne Exception)
   */
  validate(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const pipeline = yaml.load(content);
      this._validatePipeline(pipeline, filePath);
      return { valid: true, name: pipeline.name, steps: pipeline.steps.length, errors: [] };
    } catch (error) {
      return { valid: false, errors: [error.message] };
    }
  }

  /**
   * Führt eine Pipeline aus
   * @param {string} filePath - Pfad zur YAML-Datei
   * @param {object} vars - Variablen (z.B. { user: 'j.doe', group: 'Admins' })
   * @param {object} options - Optionen (dryRun, etc.)
   * @returns {object} Run-Ergebnis
   */
  async run(filePath, vars = {}, options = {}) {
    const runId = uuidv4();
    const pipeline = this.loadPipeline(filePath);
    const dryRun = options.dryRun || false;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Pipeline: ${pipeline.name}`);
    console.log(`   Run-ID:   ${runId}`);
    console.log(`   Modus:    ${dryRun ? 'DRY-RUN' : 'LIVE'}`);
    console.log(`${'='.repeat(60)}\n`);

    // Laufzeit-Kontext aufbauen
    const context = {
      trigger: { ...vars, ...pipeline.trigger },
      vars,
      steps: {},
      run: { id: runId, pipeline: pipeline.name, startedAt: new Date().toISOString() }
    };

    const run = {
      id: runId,
      pipeline: pipeline.name,
      pipelineFile: filePath,
      status: 'running',
      dryRun,
      startedAt: new Date().toISOString(),
      completedAt: null,
      vars,
      steps: [],
      rollback: null
    };

    this.runs.set(runId, run);

    // Steps sequenziell ausführen
    for (let i = 0; i < pipeline.steps.length; i++) {
      const step = pipeline.steps[i];
      const stepName = step.name || `step-${i + 1}`;

      console.log(`\n📋 Step ${i + 1}/${pipeline.steps.length}: ${stepName}`);

      const result = await this.stepExecutor.execute(step, context, dryRun);
      run.steps.push({ name: stepName, ...result });

      // Ergebnis im Kontext speichern für spätere Steps
      context.steps[stepName] = result;

      if (result.status === 'failed') {
        console.log(`\n❌ Step "${stepName}" fehlgeschlagen: ${result.error}`);
        run.status = 'failed';
        run.failedAt = stepName;

        // Rollback ausführen
        if (pipeline.rollback && pipeline.rollback.length > 0) {
          const rollbackResults = await this.rollbackHandler.execute(
            pipeline.rollback, context, i
          );
          run.rollback = rollbackResults;
        }

        run.completedAt = new Date().toISOString();
        return run;
      }

      console.log(`  ✅ Erfolgreich (${result.durationMs}ms)`);
    }

    run.status = 'completed';
    run.completedAt = new Date().toISOString();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Pipeline "${pipeline.name}" erfolgreich abgeschlossen`);
    console.log(`   Dauer: ${new Date(run.completedAt) - new Date(run.startedAt)}ms`);
    console.log(`${'='.repeat(60)}\n`);

    return run;
  }

  /**
   * Gibt alle verfügbaren Pipeline-Dateien zurück
   */
  listPipelines(pipelinesDir) {
    const dir = pipelinesDir || path.join(__dirname, '../../pipelines');
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
      .map(f => {
        try {
          const content = fs.readFileSync(path.join(dir, f), 'utf8');
          const pipeline = yaml.load(content);
          return {
            file: f,
            name: pipeline.name || f,
            description: pipeline.description || '',
            steps: (pipeline.steps || []).length,
            hasRollback: !!(pipeline.rollback && pipeline.rollback.length > 0)
          };
        } catch {
          return { file: f, name: f, error: 'Parsing fehlgeschlagen' };
        }
      });
  }

  /**
   * Gibt die Run-History zurück
   */
  getRuns(limit = 50) {
    return Array.from(this.runs.values())
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(0, limit);
  }

  /**
   * Gibt einen einzelnen Run zurück
   */
  getRun(runId) {
    return this.runs.get(runId) || null;
  }
}

module.exports = PipelineRunner;
