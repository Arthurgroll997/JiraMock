// =============================================================================
// VariableResolver — Löst {{ trigger.user }}, {{ steps.name.result.id }} auf
// =============================================================================

class VariableResolver {
  /**
   * Löst Template-Variablen in einem Wert auf
   * @param {*} value - String, Object oder Array mit {{ ... }} Platzhaltern
   * @param {object} context - Kontext mit trigger, steps, vars
   * @returns {*} Aufgelöster Wert
   */
  static resolve(value, context) {
    if (typeof value === 'string') {
      return VariableResolver._resolveString(value, context);
    }
    if (Array.isArray(value)) {
      return value.map((item) => VariableResolver.resolve(item, context));
    }
    if (value && typeof value === 'object') {
      const resolved = {};
      for (const [k, v] of Object.entries(value)) {
        resolved[k] = VariableResolver.resolve(v, context);
      }
      return resolved;
    }
    return value;
  }

  /**
   * Löst {{ ... }} Platzhalter in einem String auf
   */
  static _resolveString(str, context) {
    return str.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, expr) => {
      const trimmed = expr.trim();
      const value = VariableResolver._getNestedValue(trimmed, context);
      if (value === undefined) {
        // Unaufgelöste Variable als Warnung beibehalten
        console.warn(`[VariableResolver] Variable nicht aufgelöst: ${trimmed}`);
        return match;
      }
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    });
  }

  /**
   * Navigiert durch verschachtelte Objekte: "steps.create-user.result.id"
   */
  static _getNestedValue(path, context) {
    const parts = path.split('.');
    let current = context;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }
}

module.exports = VariableResolver;
