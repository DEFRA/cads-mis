import { downloadController } from './controller.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#downloadController', () => {
  let mockH

  beforeEach(() => {
    mockH = {
      file: vi.fn().mockReturnValue('file-response')
    }
  })

  describe('successful downloads', () => {
    test('Should download csv file with correct filename', async () => {
      const request = {
        params: { reportName: 'gb-cattle-registrations' },
        query: { year: '2026', month: '03', reportType: 'csv' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(mockH.file).toHaveBeenCalledWith('test.csv', {
        filename: 'gb-cattle-registrations_2026-03.csv',
        mode: 'attachment'
      })
      expect(result).toBe('file-response')
    })

    test('Should download xlsx file with correct extension', async () => {
      const request = {
        params: { reportName: 'gb-cattle-registrations' },
        query: { year: '2025', month: '12', reportType: 'xlsx' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(mockH.file).toHaveBeenCalledWith('test.csv', {
        filename: 'gb-cattle-registrations_2025-12.xlsx',
        mode: 'attachment'
      })
      expect(result).toBe('file-response')
    })
  })

  describe('missing parameters', () => {
    test('Should return bad request when yearMonth is missing', async () => {
      const request = {
        params: { reportName: 'gb-cattle-registrations' },
        query: { reportType: 'csv' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(mockH.file).not.toHaveBeenCalled()
    })

    test('Should return bad request when reportType is missing', async () => {
      const request = {
        params: { reportName: 'gb-cattle-registrations' },
        query: { year: '2026', month: '03' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(mockH.file).not.toHaveBeenCalled()
    })

    test('Should return bad request when all query params are missing', async () => {
      const request = {
        params: { reportName: 'gb-cattle-registrations' },
        query: {}
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(mockH.file).not.toHaveBeenCalled()
    })
  })

  describe('invalid reportType', () => {
    test('Should return bad request for invalid reportType', async () => {
      const request = {
        params: { reportName: 'gb-cattle-registrations' },
        query: { year: '2026', month: '03', reportType: 'pdf' }
      }

      const result = await downloadController.handler(request, mockH)

      expect(result.isBoom).toBe(true)
      expect(result.output.statusCode).toBe(statusCodes.badRequest)
      expect(mockH.file).not.toHaveBeenCalled()
    })
  })
})
