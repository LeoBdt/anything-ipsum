/** @type {import('jest').Config} */
module.exports = {
    displayName: 'api-tests',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    testTimeout: 60000,
    verbose: true,
    collectCoverage: false,
};
