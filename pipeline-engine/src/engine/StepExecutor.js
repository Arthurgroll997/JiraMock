// =============================================================================
// StepExecutor — Führt einzelne Pipeline-Steps gegen Connectors aus
// =============================================================================

const VariableResolver = require('./VariableResolver');

class StepExecutor {
  /**
   * @param {ConnectorRegistry} registry - Connector-Registry
   */
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * Führt einen einzelnen Step aus
   * @param {object} step - Step-Definition aus der YAML-Pipeline
   * @param {object} context - Laufzeit-Kontext (trigger, steps, vars)
   * @param {boolean} dryRun - Nur simulieren
   * @returns {object} Step-Ergebnis
   */
  async execute(step, context, dryRun = false) {
    const startTime = Date.now();
    const stepName = step.name || 'unnamed';

    try {
      // Sonderfall: wait-Step (z.B. für JIT-Zugriff mit Ablaufzeit)
      if (step.action === 'wait' || step.wait) {
        const duration = step.wait || step.params?.duration || '1s';
        const ms = this._parseDuration(duration);
        console.log(`  ⏳ [${stepName}] Warte ${duration}...`);
        if (!dryRun) {
          await new Promise(resolve => setTimeout(resolve, Math.min(ms, 5000))); // Max 5s im Test
        }
        return {
          status: 'success',
          action: 'wait',
          duration,
          durationMs: Date.now() - startTime
        };
      }

      // Connector und Action auflösen
      const connector = this.registry.get(step.system);
      const action = step.action;

      // Parameter mit Variablen auflösen
      const resolvedParams = VariableResolver.resolve(step.params || {}, context);

      console.log(`  🔧 [${stepName}] ${step.system}.${action}`, dryRun ? '(dry-run)' : '');

      // Action ausführen
      const result = await connector.execute(action, resolvedParams, dryRun);

      // Assert-Prüfung falls definiert
      if (step.assert !== undefined && !dryRun) {
        const assertResult = this._checkAssert(step.assert, result);
        if (!assertResult.passed) {
          throw new Error(`Assertion fehlgeschlagen: ${assertResult.message}`);
        }
        console.log(`  ✅ [${stepName}] Assertion bestanden`);
      }

      return {
        status: 'success',
        action: `${step.system}.${action}`,
        result,
        durationMs: Date.now() - startTime
      };

    } catch (error) {
      return {
        status: 'failed',
        action: step.action ? `${step.system}.${step.action}` : step.action,
        error: error.message,
        durationMs: Date.now() - startTime
      };
    }
  }

  /**
   * Prüft eine Assertion gegen das Ergebnis
   */
  _checkAssert(assertion, result) {
    if (typeof assertion === 'boolean') {
      // assert: true → Ergebnis muss truthy sein
      const passed = assertion ? !!result : !result;
      return { passed, message: passed ? 'OK' : `Erwartet ${assertion}, erhalten: ${JSON.stringify(result)}` };
    }
    if (typeof assertion === 'object') {
      // assert: { status: "active" } → Felder prüfen
      for (const [key, expected] of Object.entries(assertion)) {
        if (result[key] !== expected) {
          return { passed: false, message: `${key}: erwartet "${expected}", erhalten "${result[key]}"` };
        }
      }
      return { passed: true, message: 'OK' };
    }
    return { passed: true, message: 'Keine Assertion' };
  }

  /**
   * Parst eine Dauer-Angabe (z.B. "4h", "30m", "10s") in Millisekunden
   */
  _parseDuration(duration) {
    const match = String(duration).match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 1000;
    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit] || 1000);
  }
}

module.exports = StepExecutor;
