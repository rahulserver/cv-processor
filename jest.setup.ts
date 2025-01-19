import '@testing-library/jest-dom'
import { config } from 'dotenv'
import path from 'path'

// Priority order: .env.local > .env
const envFiles = ['.env', '.env.local']

envFiles.forEach(file => {
  config({
    path: path.resolve(process.cwd(), file),
    override: true  // Later files override earlier ones
  })
})

// Fallback for CI/CD or if no env files exist
if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'dummy-key-for-testing'
}

