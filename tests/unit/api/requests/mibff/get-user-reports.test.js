import { describe, it, expect, vi } from 'vitest'
import { getUserReports } from '../../../../../src/server/common/clients/requests/mibff/get-user-reports.js'
import { createApiClient } from '../../../../../src/server/common/clients/api-client.js'

// Mock createApiClient
vi.mock('../../../../../src/server/common/clients/api-client.js', () => ({
  createApiClient: vi.fn()
}))

describe('getUserReports', () => {
  it('calls api.get with the correct path and returns the result', async () => {
    const request = { info: { id: 'trace-123' } }

    const mockGet = vi.fn().mockResolvedValue([{ id: 1, name: 'Report A' }])

    // createApiClient returns an object with .get()
    createApiClient.mockReturnValue({
      get: mockGet
    })

    const result = await getUserReports(request)

    // createApiClient called with request
    expect(createApiClient).toHaveBeenCalledWith(request)

    // correct endpoint
    expect(mockGet).toHaveBeenCalledWith('/api/v1/bff/mi/reports')

    // returns the value from mockGet
    expect(result).toEqual([{ id: 1, name: 'Report A' }])
  })
})
