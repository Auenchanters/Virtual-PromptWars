module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/src/config/firebaseAdmin.js',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/firebaseAdmin.js',
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      statements: 70,
      branches: 70,
      functions: 70,
    },
  },
};
