/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        diagnostics: false,
        astTransformers: {
          before: ['./importMetaTransformer.cjs'],
        },
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.cjs',
  },
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 75,
      statements: 80,
      functions: 75,
    },
  },
};
