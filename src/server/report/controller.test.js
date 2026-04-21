import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { reportPermissionTypes } from '../../auth/constants/permissions.js'
import { getUserReportPermissions } from '../common/clients/requests/mibff/get-user-report-permissions.js'

vi.mock('../../auth/auth-required.js', () => ({
  authRequired: vi.fn((_req, h) => h.continue)
}))

vi.mock(
  '../common/clients/requests/mibff/get-user-report-permissions.js',
  () => ({
    getUserReportPermissions: vi.fn()
  })
)

getUserReportPermissions.mockResolvedValue({
  reportKey: 'holding_summary',
  permissions: [reportPermissionTypes.view, reportPermissionTypes.export]
})

describe('#reportController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('Should render holding summary when REPORT_VIEW is granted', async () => {
    getUserReportPermissions.mockResolvedValue({
      reportKey: 'holding_summary',
      permissions: ['REPORT_VIEW']
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/report/holding_summary'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Holding Summary')
  })

  test('Should render GB cattle registrations when REPORT_VIEW is granted', async () => {
    getUserReportPermissions.mockResolvedValue({
      reportKey: 'gb_cattle_registrations',
      permissions: ['REPORT_VIEW']
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/report/gb_cattle_registrations'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Monthly GB cattle registrations')
  })

  test('Should return 403 when REPORT_VIEW is missing', async () => {
    getUserReportPermissions.mockResolvedValue({
      reportKey: 'holding_summary',
      permissions: []
    })

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/report/holding_summary'
    })

    expect(statusCode).toBe(statusCodes.forbidden)
  })

  test('Should return 502 when handshake API fails', async () => {
    getUserReportPermissions.mockRejectedValue(new Error('Exception'))

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/report/holding_summary'
    })

    expect(statusCode).toBe(statusCodes.badGateway)
  })
})
