module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!**/node_modules/**'
    ],
    coverageReporters: ['text', 'lcov', 'clover'],
    testMatch: [
        '**/test/unit/**/*.test.js',
        '**/test/integration/**/*.test.js',
        '**/test/e2e/**/*.test.js',
        '**/test/security/**/*.test.js'
    ],
    setupFilesAfterEnv: ['./test/setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: false,
    restoreMocks: true
};