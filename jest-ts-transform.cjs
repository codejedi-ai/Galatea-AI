/**
 * Jest transform that uses Node's native TypeScript type stripping.
 * Also converts ESM import/export syntax to CommonJS for jest compatibility.
 * Requires Node 22.6+ (available in Node 24 without experimental flags).
 */
const { stripTypeScriptTypes } = require("node:module")

module.exports = {
  process(sourceText) {
    let code = sourceText

    // Strip TypeScript types first
    try {
      code = stripTypeScriptTypes(code, { mode: "strip" })
    } catch {
      // If stripping fails, continue with original
    }

    // Convert ESM imports to CJS requires
    // Handle: import { a, b } from 'module'
    code = code.replace(
      /^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/gm,
      function(_, imports, mod) {
        var names = imports.split(",").map(function(s) { return s.trim() }).filter(Boolean)
        return "const { " + names.join(", ") + " } = require('" + mod + "')"
      }
    )

    // Handle: import defaultExport from 'module'
    code = code.replace(
      /^import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/gm,
      function(_, name, mod) { return "const " + name + " = require('" + mod + "')" }
    )

    // Handle: export default ...
    code = code.replace(/^export\s+default\s+/gm, "module.exports = ")

    // Handle: export { a, b }
    code = code.replace(
      /^export\s*\{([^}]+)\}/gm,
      function(_, exports) {
        var names = exports.split(",").map(function(s) { return s.trim() }).filter(Boolean)
        return names.map(function(n) { return "module.exports." + n + " = " + n }).join("\n")
      }
    )

    return { code: code }
  },
}
