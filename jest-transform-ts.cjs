/**
 * Custom jest transform using Node.js built-in TypeScript stripping.
 * Works with Node.js 22.6+ which includes experimental-strip-types.
 * Then converts the result to CommonJS using @babel/plugin-transform-modules-commonjs.
 */
const os = require('os')
const path = require('path')
const { stripTypeScriptTypes } = require('node:module')

// Find @babel/plugin-transform-modules-commonjs in npx caches
function findPlugin(name) {
  const home = os.homedir()
  const bases = [
    path.join(home, 'AppData/Local/npm-cache/_npx/4b80fa6da744c799/node_modules'),
    path.join(home, 'AppData/Local/npm-cache/_npx/b8d86e6551a4f492/node_modules'),
    path.join(home, 'AppData/Local/npm-cache/_npx/2945e3c7a38efdf6/node_modules'),
    path.join(home, '.npm/_npx/4b80fa6da744c799/node_modules'),
  ]
  for (const base of bases) {
    try {
      return require.resolve(path.join(base, name))
    } catch {
      // try next
    }
  }
  return null
}

const babelCore = findPlugin('@babel/core')
const transformModules = findPlugin('@babel/plugin-transform-modules-commonjs')

module.exports = {
  process(sourceText, sourcePath) {
    // Step 1: Strip TypeScript types using Node.js built-in
    let jsCode
    try {
      jsCode = stripTypeScriptTypes(sourceText, {
        filename: sourcePath,
        sourceMap: false,
      })
    } catch (e) {
      // If stripping fails, return source as-is
      jsCode = sourceText
    }

    // Step 2: Convert ESM imports to CommonJS if babel is available
    if (babelCore && transformModules) {
      try {
        const babel = require(babelCore)
        const result = babel.transformSync(jsCode, {
          filename: sourcePath,
          configFile: false,
          babelrc: false,
          plugins: [
            [require(transformModules), { strictMode: false }],
          ],
        })
        if (result && result.code) {
          return { code: result.code }
        }
      } catch (e) {
        // Fall through to return jsCode as-is
      }
    }

    return { code: jsCode }
  },
}
