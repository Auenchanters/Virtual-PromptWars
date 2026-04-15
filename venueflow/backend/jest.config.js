module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
        types: ['node', 'jest'],
        skipLibCheck: true,
      },
    }],
  },
  testMatch: ['**/__tests__/**/*.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/src/config/firebaseAdmin.ts',
    '/src/scripts/',
    '/src/server.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/config/firebaseAdmin.ts',
    '!src/scripts/**',
    '!src/server.ts',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      statements: 90,
      branches: 70,
      functions: 85,
    },
    './src/routes/': {
      lines: 88,
      statements: 88,
      branches: 60,
      functions: 85,
    },
    './src/utils/': {
      lines: 100,
      statements: 100,
      branches: 100,
      functions: 100,
    },
  },
};
