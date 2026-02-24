import { vi } from 'vitest'

// Silence noisy logs during tests
vi.spyOn(console, 'error').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.API_BASE_URL = 'http://localhost:3000'
