/**
 * Custom Jest transform that uses Node's built-in TypeScript type stripping.
 * Requires Node.js 22.6+ (available in Node 24).
 */
const { stripTypeScriptTypes } = require('node:module')

module.exports = {
  process(sourceText, sourcePath) {
    if (sourcePath.endsWith('.ts') || sourcePath.endsWith('.tsx')) {
      const stripped = stripTypeScriptTypes(sourceText, { mode: 'strip' })
      return { code: stripped }
    }
    return { code: sourceText }
  },
}
