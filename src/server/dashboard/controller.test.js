import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { JSDOM } from 'jsdom'

vi.mock(import('../common/clients/requests/mibff/get-user-reports.js'), () => ({
  getUserReports: vi.fn()
}))

const { getUserReports } = await import(
  '../common/clients/requests/mibff/get-user-reports.js'
)

describe('#dashboardController', () => {
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

  describe('GET reports page with reports', async () => {
    const mockResponse = [
      {
        reportId: 'some-id',
        title: 'Important Report',
        description: 'Important details',
        reportKey: 'important-report-key',
        isActive: true
      }
    ]
    let response = null

    beforeAll(async () => {
      getUserReports.mockResolvedValue(mockResponse)
      response = await server.inject({
        method: 'GET',
        url: '/dashboard',
        auth: {
          strategy: 'session',
          credentials: {
            user: {
              roles: ['mip-viewer']
            }
          }
        }
      })
    })

    test('Should show dashboard page', async () => {
      expect(response.result).toEqual(expect.stringContaining('Dashboard |'))
      expect(response.statusCode).toBe(statusCodes.ok)
    })

    test('Should show link to report', async () => {
      const dom = new JSDOM(response.result)
      const { body } = dom.window.document

      const link = body.querySelector('a.portal-card-link')

      expect(link).not.toBeNull()
      expect(link?.getAttribute('href')).toEqual(
        expect.stringContaining('report/important-report-key')
      )
      expect(
        link?.querySelector('.govuk-summary-card__title').innerHTML
      ).toEqual(expect.stringContaining('Important Report'))
      expect(link?.querySelector('.govuk-body-s').innerHTML).toEqual(
        expect.stringContaining('Important details')
      )
    })
  })

  describe('GET reports page with no reports', async () => {
    const emptyMockResponse = []
    let response = null

    beforeAll(async () => {
      getUserReports.mockResolvedValue(emptyMockResponse)
      response = await server.inject({
        method: 'GET',
        url: '/dashboard',
        auth: {
          strategy: 'session',
          credentials: {
            user: {
              roles: ['mip-viewer']
            }
          }
        }
      })
    })

    test('Should show dashboard page', async () => {
      expect(response.result).toEqual(expect.stringContaining('Dashboard |'))
      expect(response.statusCode).toBe(statusCodes.ok)
    })

    test('Should show holding message for no reports', async () => {
      expect(response.result).toEqual(
        expect.stringContaining('No reports found.')
      )
    })
  })
})
