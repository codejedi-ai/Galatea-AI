/**
 * Shim for node: protocol imports when running under jest.
 * Maps node:test → jest globals, node:assert → actual assert module.
 *
 * Usage: set moduleNameMapper '^node:(.*)$': '<rootDir>/jest-node-shim.cjs'
 * Note: jest injects the requested module name via the __JEST_MODULE__ env var trick;
 * instead we return a proxy that delegates based on the specifier captured in the mapper.
 *
 * Because jest's moduleNameMapper maps ALL node:* to this one file, we need
 * to detect which sub-module was requested via the file path hack.
 *
 * Simpler approach: export both assert and test shimmed exports and let
 * destructuring in the test file pick what it needs.
 */

// Re-export node:assert/strict
const assert = require('node:assert/strict')

// Re-export jest-compatible describe/it wrappers that call jest globals
const describe = global.describe
const it = global.it
const test = global.test
const beforeEach = global.beforeEach
const afterEach = global.afterEach
const beforeAll = global.beforeAll
const afterAll = global.afterAll

// node:assert/strict exports
module.exports = assert

// Also attach test exports for when the shim is used for node:test
module.exports.describe = describe
module.exports.it = it
module.exports.test = test
module.exports.beforeEach = beforeEach
module.exports.afterEach = afterEach
module.exports.beforeAll = beforeAll
module.exports.afterAll = afterAll
module.exports.default = module.exports
