// =============================================================================
// RollbackHandler — Führt Rollback-Schritte bei Fehler in umgekehrter Reihenfolge aus
// =============================================================================

const VariableResolver = require('./VariableResolver');

class RollbackHandler {
  /**
   * @param {ConnectorRegistry} registry - Connector-Registry
   */
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * Führt Rollback-Steps in umgekehrter Reihenfolge aus
   * @param {Array} rollbackSteps - Rollback-Schritte aus der Pipeline-Definition
   * @param {object} context - Laufzeit-Kontext
   * @param {number} failedAtIndex - Index des fehlgeschlagenen Steps
   * @returns {Array} Ergebnisse der Rollback-Schritte
   */
  async execute(rollbackSteps, context, failedAtIndex) {
    if (!rollbackSteps || rollbackSteps.length === 0) {
      console.log('  ⚠️  Keine Rollback-Schritte definiert');
      return [];
    }

    console.log(`\n🔄 Rollback wird ausgeführt (${rollbackSteps.length} Schritte)...`);
    const results = [];

    // Rollback-Schritte in umgekehrter Reihenfolge ausführen
    const stepsToRun = [...rollbackSteps].reverse();

    for (const step of stepsToRun) {
      const stepName = step.name || `${step.system}.${step.action}`;
      try {
        const connector = this.registry.get(step.system);
        const resolvedParams = VariableResolver.resolve(step.params || {}, context);

        console.log(`  ↩️  [Rollback] ${stepName}`);
        const result = await connector.execute(step.action, resolvedParams);

        results.push({
          step: stepName,
          status: 'success',
          result
        });
      } catch (error) {
        console.error(`  ❌ [Rollback] ${stepName} fehlgeschlagen: ${error.message}`);
        results.push({
          step: stepName,
          status: 'failed',
          error: error.message
        });
        // Rollback-Fehler stoppen nicht den gesamten Rollback
      }
    }

    return results;
  }
}

module.exports = RollbackHandler;
