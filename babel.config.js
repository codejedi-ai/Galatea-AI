const path = require('path')
const os = require('os')

// babel-jest (from npx jest cache) needs plugins to handle TypeScript.
// Find the jest npx cache that has @babel/plugin-syntax-typescript available.
function findJestCache() {
  const home = os.homedir()
  const bases = [
    path.join(home, 'AppData/Local/npm-cache/_npx/b8d86e6551a4f492/node_modules'),
    path.join(home, '.npm/_npx/b8d86e6551a4f492/node_modules'),
  ]
  for (const base of bases) {
    try {
      require.resolve(path.join(base, '@babel/plugin-syntax-typescript'))
      return base
    } catch {
      // try next
    }
  }
  return null
}

const cache = findJestCache()

const plugins = []
const presets = []

if (cache) {
  try {
    presets.push([require.resolve(path.join(cache, 'babel-preset-current-node-syntax'))])
  } catch { /* ignore */ }
  try {
    plugins.push([require.resolve(path.join(cache, '@babel/plugin-syntax-typescript')), { allExtensions: true }])
  } catch { /* ignore */ }
}

module.exports = {
  presets,
  plugins,
}
