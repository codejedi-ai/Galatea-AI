/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "<rootDir>/jest-ts-transform.cjs",
  },
  moduleNameMapper: {
    "^node:test$": "<rootDir>/jest-node-test-shim.cjs",
    "^node:assert/strict$": "<rootDir>/jest-node-assert-shim.cjs",
    "^node:assert$": "<rootDir>/jest-node-assert-shim.cjs",
  },
}

module.exports = config
