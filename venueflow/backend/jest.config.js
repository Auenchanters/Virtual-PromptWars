module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/src/config/firebaseAdmin.js',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/config/firebaseAdmin.js',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      branches: 80,
      functions: 80,
    },
  },
};
