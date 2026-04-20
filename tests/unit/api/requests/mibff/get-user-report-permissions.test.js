import { describe, it, expect, vi } from 'vitest'
import { reportPermissionTypes } from '../../../../../src/auth/constants/permissions.js'
import { getUserReportPermissions } from '../../../../../src/server/common/clients/requests/mibff/get-user-report-permissions.js'
import { createApiClient } from '../../../../../src/server/common/clients/api-client.js'

// Mock createApiClient
vi.mock('../../../../../src/server/common/clients/api-client.js', () => ({
  createApiClient: vi.fn()
}))

describe('getUserReportPermissions', () => {
  it('calls api.get with the correct path and returns the result', async () => {
    const request = { info: { id: 'trace-123' } }
    const reportKey = 'holding_summary'

    const mockGet = vi.fn().mockResolvedValue({
      reportKey,
      permissions: [reportPermissionTypes.view, reportPermissionTypes.export]
    })

    // createApiClient returns an object with .get()
    createApiClient.mockReturnValue({
      get: mockGet
    })

    const result = await getUserReportPermissions(request, reportKey)

    // createApiClient called with request
    expect(createApiClient).toHaveBeenCalledWith(request)

    // correct endpoint
    expect(mockGet).toHaveBeenCalledWith(
      `/api/v1/bff/mi/reports/${reportKey}/permissions`
    )

    // returns the value from mockGet
    expect(result).toEqual({
      reportKey: 'holding_summary',
      permissions: ['REPORT_VIEW', 'REPORT_EXPORT']
    })
  })
})
