import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'pdfjs-dist/build/pdf.worker.entry': '<rootDir>/node_modules/pdfjs-dist/build/pdf.worker.js',
    '^(\\.{1,2}/.*)\\.js$': '$1', // Map ESM imports with .js
  },
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest', // Use Babel for transformation
  },
  transformIgnorePatterns: [
    'node_modules/(?!pdfjs-dist/)', // Transform `pdfjs-dist` to handle ESM
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'], // Treat TypeScript as ESM
};

export default createJestConfig(config);
