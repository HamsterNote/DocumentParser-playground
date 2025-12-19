/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@parser/(.*)$': '<rootDir>/src/parser/$1',
    '^@DocumentParser$': '<rootDir>/src/parser/DocumentParser',
    '^@PdfParser$': '<rootDir>/src/parser/PdfParser',
    '^@HtmlParser$': '<rootDir>/src/parser/HtmlParser',
    '^@math$': '<rootDir>/src/types/common/math',
    '^@typesCommon/(.*)$': '<rootDir>/src/types/common/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { useESM: true, tsconfig: 'tsconfig.jest.json', diagnostics: false }
    ]
  }
}
