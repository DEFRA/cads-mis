import { describe, test, expect, vi, beforeEach } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'

vi.mock(import('../common/clients/requests/mibff/download-reports.js'), () => ({
  downloadReport: vi.fn()
}))

const { downloadReport } = await import(
  '../common/clients/requests/mibff/download-reports.js'
)

describe('#downloadController', () => {
  let mockH

  beforeEach(() => {
    mockH = {
      response: vi.fn().mockReturnThis(),
      type: vi.fn().mockReturnThis(),
      header: vi.fn().mockReturnThis()
    }
  })

  describe('cattle_registrations', () => {
    describe('successful downloads', () => {
      test.skip('Should download csv file with correct filename', async () => {
        const csvBytes = new TextEncoder().encode('a,b\n1,2')
        downloadReport.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(csvBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportKey: 'cattle_registrations' },
          payload: { year: '2026', month: '03', reportType: 'csv' }
        }

        await downloadController.handler(request, mockH)

        expect(downloadReport).toHaveBeenCalledWith(
          request,
          'cattle_registrations',
          { month: '03', year: '2026', reportType: 'csv' }
        )
        expect(mockH.response).toHaveBeenCalledWith(
          Buffer.from(csvBytes.buffer)
        )
        expect(mockH.type).toHaveBeenCalledWith('text/csv')
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="cattle_registrations_2026-03.csv"'
        )
      })

      test('Should zero-pad single-digit month from form picker (e.g. "3" → "03")', async () => {
        const csvBytes = new TextEncoder().encode('a,b\n1,2')
        downloadReport.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(csvBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportKey: 'cattle_registrations' },
          payload: { year: '2026', month: '3', reportType: 'xlsx' }
        }

        await downloadController.handler(request, mockH)

        expect(downloadReport).toHaveBeenCalledWith(
          request,
          'cattle_registrations',
          { month: '03', year: '2026', reportType: 'xlsx' }
        )
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="cattle_registrations_2026-03.xlsx"'
        )
      })

      test('Should download xlsx file with correct content type', async () => {
        const xlsxBytes = new Uint8Array([0, 1, 2, 3])
        downloadReport.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(xlsxBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportKey: 'cattle_registrations' },
          payload: { year: '2025', month: '12', reportType: 'xlsx' }
        }

        await downloadController.handler(request, mockH)

        expect(mockH.type).toHaveBeenCalledWith(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="cattle_registrations_2025-12.xlsx"'
        )
      })
    })

    describe('backend errors', () => {
      test('Should propagate backend errors', async () => {
        const { default: Boom } = await import('@hapi/boom')
        downloadReport.mockRejectedValue(
          Boom.internal('Backend error: 500 Internal Server Error')
        )

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportKey: 'cattle_registrations' },
          payload: { year: '2026', month: '03', reportType: 'csv' }
        }

        await expect(
          downloadController.handler(request, mockH)
        ).rejects.toThrow()
      })
    })
  })

  describe('cattle_deaths', () => {
    describe('successful downloads', () => {
      test.skip('Should download csv file with correct filename', async () => {
        const csvBytes = new TextEncoder().encode('a,b\n1,2')
        downloadReport.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(csvBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportKey: 'cattle_deaths' },
          payload: { year: '2026', month: '03', reportType: 'csv' }
        }

        await downloadController.handler(request, mockH)

        expect(downloadReport).toHaveBeenCalledWith(request, 'cattle_deaths', {
          month: '03',
          year: '2026',
          reportType: 'csv'
        })
        expect(mockH.response).toHaveBeenCalledWith(
          Buffer.from(csvBytes.buffer)
        )
        expect(mockH.type).toHaveBeenCalledWith('text/csv')
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="cattle_deaths_2026-03.csv"'
        )
      })

      test('Should zero-pad single-digit month from form picker (e.g. "3" → "03")', async () => {
        const csvBytes = new TextEncoder().encode('a,b\n1,2')
        downloadReport.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(csvBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportKey: 'cattle_deaths' },
          payload: { year: '2026', month: '3', reportType: 'xlsx' }
        }

        await downloadController.handler(request, mockH)

        expect(downloadReport).toHaveBeenCalledWith(request, 'cattle_deaths', {
          month: '03',
          year: '2026',
          reportType: 'xlsx'
        })
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="cattle_deaths_2026-03.xlsx"'
        )
      })

      test('Should download xlsx file with correct content type', async () => {
        const xlsxBytes = new Uint8Array([0, 1, 2, 3])
        downloadReport.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(xlsxBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportKey: 'cattle_deaths' },
          payload: { year: '2025', month: '12', reportType: 'xlsx' }
        }

        await downloadController.handler(request, mockH)

        expect(mockH.type).toHaveBeenCalledWith(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="cattle_deaths_2025-12.xlsx"'
        )
      })
    })

    describe('backend errors', () => {
      test('Should propagate backend errors', async () => {
        const { default: Boom } = await import('@hapi/boom')
        downloadReport.mockRejectedValue(
          Boom.internal('Backend error: 500 Internal Server Error')
        )

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportKey: 'cattle_deaths' },
          payload: { year: '2026', month: '03', reportType: 'csv' }
        }

        await expect(
          downloadController.handler(request, mockH)
        ).rejects.toThrow()
      })
    })
  })

  describe('missing parameters', () => {
    test('Should return bad request when year and month are missing', async () => {
      const { downloadController } = await import('./controller.js')

      const request = {
        params: { reportKey: 'cattle_registrations' },
        payload: { reportType: 'csv' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(downloadReport).not.toHaveBeenCalled()
    })

    test.skip('Should return bad request when reportType is missing', async () => {
      const { downloadController } = await import('./controller.js')

      const request = {
        params: { reportKey: 'cattle_registrations' },
        payload: { year: '2026', month: '03' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(downloadReport).not.toHaveBeenCalled()
    })

    test('Should return bad request when payload is missing', async () => {
      const { downloadController } = await import('./controller.js')

      const request = {
        params: { reportKey: 'cattle_registrations' },
        payload: null
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(downloadReport).not.toHaveBeenCalled()
    })
  })

  describe('invalid reportType', () => {
    test.skip('Should return bad request for invalid reportType', async () => {
      const { downloadController } = await import('./controller.js')

      const request = {
        params: { reportKey: 'cattle_registrations' },
        payload: { year: '2026', month: '03', reportType: 'pdf' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(downloadReport).not.toHaveBeenCalled()
    })
  })
})
