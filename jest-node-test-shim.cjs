/**
 * Shim for node:test — maps to jest globals so tests work inside jest's runner.
 */
module.exports = {
  describe: global.describe,
  test: global.test,
  it: global.it,
  beforeEach: global.beforeEach,
  afterEach: global.afterEach,
  beforeAll: global.beforeAll,
  afterAll: global.afterAll,
}
