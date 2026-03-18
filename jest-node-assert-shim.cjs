/**
 * Shim for node:assert/strict — passes through to native assert.
 */
var assert = require("assert/strict")
module.exports = assert
module.exports.default = assert
