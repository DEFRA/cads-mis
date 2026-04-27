import { statusCodes } from '../common/constants/status-codes.js'
import { reportNames } from '../common/constants/report-names.js'

vi.mock(import('../common/clients/requests/mibff/download-reports.js'), () => ({
  downloadCattleRegistrations: vi.fn(),
  downloadCattleDeaths: vi.fn()
}))

const { downloadCattleRegistrations, downloadCattleDeaths } = await import(
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

  describe(`${reportNames.gbCattleRegistrations}`, () => {
    describe('successful downloads', () => {
      test('Should download csv file with correct filename', async () => {
        const csvBytes = new TextEncoder().encode('a,b\n1,2')
        downloadCattleRegistrations.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(csvBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportName: reportNames.gbCattleRegistrations },
          payload: { year: '2026', month: '03', reportType: 'csv' }
        }

        await downloadController.handler(request, mockH)

        expect(downloadCattleRegistrations).toHaveBeenCalledWith(request, {
          month: '03',
          year: '2026',
          reportType: 'csv'
        })
        expect(downloadCattleDeaths).not.toHaveBeenCalled()
        expect(mockH.response).toHaveBeenCalledWith(
          Buffer.from(csvBytes.buffer)
        )
        expect(mockH.type).toHaveBeenCalledWith('text/csv')
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="gb-cattle-registrations_2026-03.csv"'
        )
      })

      test('Should zero-pad single-digit month from form picker (e.g. "3" → "03")', async () => {
        const csvBytes = new TextEncoder().encode('a,b\n1,2')
        downloadCattleRegistrations.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(csvBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportName: reportNames.gbCattleRegistrations },
          payload: { year: '2026', month: '3', reportType: 'csv' }
        }

        await downloadController.handler(request, mockH)

        expect(downloadCattleRegistrations).toHaveBeenCalledWith(request, {
          month: '03',
          year: '2026',
          reportType: 'csv'
        })
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="gb-cattle-registrations_2026-03.csv"'
        )
      })

      test('Should download xlsx file with correct content type', async () => {
        const xlsxBytes = new Uint8Array([0, 1, 2, 3])
        downloadCattleRegistrations.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(xlsxBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportName: reportNames.gbCattleRegistrations },
          payload: { year: '2025', month: '12', reportType: 'xlsx' }
        }

        await downloadController.handler(request, mockH)

        expect(mockH.type).toHaveBeenCalledWith(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="gb-cattle-registrations_2025-12.xlsx"'
        )
      })
    })
  })

  describe(`${reportNames.gbCattleDeaths}`, () => {
    describe('successful downloads', () => {
      test('Should download csv file with correct filename', async () => {
        const csvBytes = new TextEncoder().encode('a,b\n1,2')
        downloadCattleDeaths.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(csvBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportName: reportNames.gbCattleDeaths },
          payload: { year: '2026', month: '03', reportType: 'csv' }
        }

        await downloadController.handler(request, mockH)

        expect(downloadCattleDeaths).toHaveBeenCalledWith(request, {
          month: '03',
          year: '2026',
          reportType: 'csv'
        })
        expect(downloadCattleRegistrations).not.toHaveBeenCalled()
        expect(mockH.response).toHaveBeenCalledWith(
          Buffer.from(csvBytes.buffer)
        )
        expect(mockH.type).toHaveBeenCalledWith('text/csv')
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="gb-cattle-deaths_2026-03.csv"'
        )
      })

      test('Should zero-pad single-digit month from form picker (e.g. "3" → "03")', async () => {
        const csvBytes = new TextEncoder().encode('a,b\n1,2')
        downloadCattleDeaths.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(csvBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportName: reportNames.gbCattleDeaths },
          payload: { year: '2026', month: '3', reportType: 'csv' }
        }

        await downloadController.handler(request, mockH)

        expect(downloadCattleDeaths).toHaveBeenCalledWith(request, {
          month: '03',
          year: '2026',
          reportType: 'csv'
        })
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="gb-cattle-deaths_2026-03.csv"'
        )
      })

      test('Should download xlsx file with correct content type', async () => {
        const xlsxBytes = new Uint8Array([0, 1, 2, 3])
        downloadCattleDeaths.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(xlsxBytes.buffer)
        })

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportName: reportNames.gbCattleDeaths },
          payload: { year: '2025', month: '12', reportType: 'xlsx' }
        }

        await downloadController.handler(request, mockH)

        expect(mockH.type).toHaveBeenCalledWith(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        expect(mockH.header).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="gb-cattle-deaths_2025-12.xlsx"'
        )
      })
    })

    describe('backend errors', () => {
      test('Should propagate backend errors', async () => {
        const { default: Boom } = await import('@hapi/boom')
        downloadCattleDeaths.mockRejectedValue(
          Boom.internal('Backend error: 500 Internal Server Error')
        )

        const { downloadController } = await import('./controller.js')

        const request = {
          params: { reportName: reportNames.gbCattleDeaths },
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
        params: { reportName: reportNames.gbCattleRegistrations },
        payload: { reportType: 'csv' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(downloadCattleRegistrations).not.toHaveBeenCalled()
      expect(downloadCattleDeaths).not.toHaveBeenCalled()
    })

    test('Should return bad request when reportType is missing', async () => {
      const { downloadController } = await import('./controller.js')

      const request = {
        params: { reportName: reportNames.gbCattleRegistrations },
        payload: { year: '2026', month: '03' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(downloadCattleRegistrations).not.toHaveBeenCalled()
      expect(downloadCattleDeaths).not.toHaveBeenCalled()
    })

    test('Should return bad request when payload is missing', async () => {
      const { downloadController } = await import('./controller.js')

      const request = {
        params: { reportName: reportNames.gbCattleRegistrations },
        payload: null
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(downloadCattleRegistrations).not.toHaveBeenCalled()
      expect(downloadCattleDeaths).not.toHaveBeenCalled()
    })
  })

  describe('invalid reportType', () => {
    test('Should return bad request for invalid reportType', async () => {
      const { downloadController } = await import('./controller.js')

      const request = {
        params: { reportName: reportNames.gbCattleRegistrations },
        payload: { year: '2026', month: '03', reportType: 'pdf' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(downloadCattleRegistrations).not.toHaveBeenCalled()
      expect(downloadCattleDeaths).not.toHaveBeenCalled()
    })
  })

  describe('backend errors', () => {
    test('Should propagate backend errors for registrations', async () => {
      const { default: Boom } = await import('@hapi/boom')
      downloadCattleRegistrations.mockRejectedValue(
        Boom.internal('Backend error: 500 Internal Server Error')
      )

      const { downloadController } = await import('./controller.js')

      const request = {
        params: { reportName: reportNames.gbCattleRegistrations },
        payload: { year: '2026', month: '03', reportType: 'csv' }
      }

      await expect(downloadController.handler(request, mockH)).rejects.toThrow()
    })
  })
})
