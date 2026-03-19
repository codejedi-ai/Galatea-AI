/**
 * Shim for `node:test` when running under Jest.
 * Delegates describe/it/test to jest globals.
 */
module.exports = {
  describe: global.describe,
  it: global.it,
  test: global.test,
  beforeEach: global.beforeEach,
  afterEach: global.afterEach,
  beforeAll: global.beforeAll,
  afterAll: global.afterAll,
}
