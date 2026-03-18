/** @type {import('jest').Config} */
const config = {
  // Only look for test files in __tests__ and only .test.ts/.test.tsx files
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  // Ignore the ts-loader helper and node_modules
  testPathIgnorePatterns: ['/node_modules/', 'ts-loader\\.mjs$'],
  // Transform TypeScript files using Node's built-in stripTypeScriptTypes
  transform: {
    '^.+\\.tsx?$': '<rootDir>/jest-ts-transform.cjs',
  },
  // Map node: protocol imports and @/* path alias
  moduleNameMapper: {
    '^node:test$': '<rootDir>/jest-shims/node-test.cjs',
    '^node:assert/strict$': '<rootDir>/jest-shims/node-assert-strict.cjs',
    '^node:assert$': '<rootDir>/jest-shims/node-assert.cjs',
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Don't transform node_modules
  transformIgnorePatterns: ['/node_modules/'],
  // Use node test environment
  testEnvironment: 'node',
  // Allow extensionless imports (jest will try .ts, .js etc)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Run tests as ESM
  extensionsToTreatAsEsm: ['.ts'],
}

module.exports = config
