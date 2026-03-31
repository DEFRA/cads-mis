import { beforeEach, describe, expect, vi } from 'vitest'

import { fetchJsonFromBackend } from './fetch-json-from-backend.js'

vi.mock(import('./fetch-json.js'))

const { fetchJson } = await import('./fetch-json.js')

describe('#fetchJsonFromBackend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should prepend backend URL to relative paths', async () => {
    vi.mocked(fetchJson).mockResolvedValue({ data: 'test' })

    await fetchJsonFromBackend('/v1/test', { method: 'GET' })

    expect(fetchJson).toHaveBeenCalledWith(
      expect.stringMatching(/^http.*\/v1\/test$/),
      { method: 'GET' }
    )
  })

  test('should use absolute URLs as-is', async () => {
    vi.mocked(fetchJson).mockResolvedValue({ data: 'test' })

    await fetchJsonFromBackend('https://external.api.com/endpoint', {
      method: 'GET'
    })

    expect(fetchJson).toHaveBeenCalledWith(
      'https://external.api.com/endpoint',
      {
        method: 'GET'
      }
    )
  })

  test('should return response from fetchJson', async () => {
    const mockResponse = { status: 'validated', id: '123' }
    vi.mocked(fetchJson).mockResolvedValue(mockResponse)

    const result = await fetchJsonFromBackend('/v1/test')

    expect(result).toStrictEqual(mockResponse)
  })

  test('should propagate errors from fetchJson', async () => {
    const mockError = new Error('fetch failed')
    vi.mocked(fetchJson).mockRejectedValue(mockError)

    await expect(fetchJsonFromBackend('/v1/test')).rejects.toThrow(
      'fetch failed'
    )
  })
})
