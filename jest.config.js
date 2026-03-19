const path = require('path')

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.[jt]sx?$': path.resolve(__dirname, 'jest-transform-ts.cjs'),
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(zod)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'cjs', 'mjs', 'jsx', 'json'],
}

module.exports = config
