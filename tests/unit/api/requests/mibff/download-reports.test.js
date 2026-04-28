import { describe, it, expect, vi } from 'vitest'
import { downloadReport } from '../../../../../src/server/common/clients/requests/mibff/download-reports.js'
import { createApiClient } from '../../../../../src/server/common/clients/api-client.js'

vi.mock('../../../../../src/server/common/clients/api-client.js', () => ({
  createApiClient: vi.fn()
}))

describe('downloadReport', () => {
  it('calls api.post with the correct path, params, and stream flag for cattle_registrations, and returns the result', async () => {
    const request = { info: { id: 'trace-123' } }
    const params = { month: '03', year: '2026', reportType: 'csv' }
    const mockResponse = { arrayBuffer: vi.fn() }

    const mockPost = vi.fn().mockResolvedValue(mockResponse)
    createApiClient.mockReturnValue({ post: mockPost })

    const result = await downloadReport(request, 'cattle_registrations', params)

    expect(createApiClient).toHaveBeenCalledWith(request)
    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/bff/mi/reports/cattle_registrations',
      params,
      true // stream = true — returns raw Response, not parsed JSON
    )
    expect(result).toBe(mockResponse)
  })

  it('calls api.post with the correct path, params, and stream flag for cattle_deaths, and returns the result', async () => {
    const request = { info: { id: 'trace-123' } }
    const params = { month: '03', year: '2026', reportType: 'csv' }
    const mockResponse = { arrayBuffer: vi.fn() }

    const mockPost = vi.fn().mockResolvedValue(mockResponse)
    createApiClient.mockReturnValue({ post: mockPost })

    const result = await downloadReport(request, 'cattle_deaths', params)

    expect(createApiClient).toHaveBeenCalledWith(request)
    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/bff/mi/reports/cattle_deaths',
      params,
      true
    )
    expect(result).toBe(mockResponse)
  })
})
