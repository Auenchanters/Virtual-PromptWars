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
    '/src/config/firebaseAdmin.js',
    '/src/scripts/',
    '/src/services/geminiService.ts',
    '/src/server.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/config/firebaseAdmin.js',
    '!src/scripts/**',
    '!src/services/geminiService.ts',
    '!src/server.ts',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 85,
      statements: 85,
      branches: 75,
      functions: 85,
    },
    './src/routes/': {
      lines: 85,
      statements: 85,
      branches: 70,
      functions: 85,
    },
    './src/utils/': {
      lines: 95,
      statements: 95,
      branches: 70,
      functions: 95,
    },
  },
};
