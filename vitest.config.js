import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    include: ['tests/**/*.{test,spec}.{js,ts}', 'src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: [
        ...configDefaults.exclude,
        '**/*.test.*',
        '**/*.spec.*',
        '.public',
        'coverage',
        'postcss.config.js',
        'stylelint.config.js',
        '**/*.md',
        '**/*.njk'
      ]
    }
  }
})
