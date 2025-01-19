import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'pdfjs-dist/build/pdf.worker.entry': '<rootDir>/node_modules/pdfjs-dist/build/pdf.worker.js'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}

export default createJestConfig(config)