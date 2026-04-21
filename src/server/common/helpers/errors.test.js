import Boom from '@hapi/boom'

import { catchAll } from './errors.js'
import { statusCodes } from '../constants/status-codes.js'

function mockRequest(response, logger) {
  return {
    response,
    logger: logger ?? { error: vi.fn() }
  }
}

function mockToolkit() {
  const h = {
    continue: Symbol('continue'),
    view: vi.fn()
  }
  const viewResponse = { code: vi.fn() }
  h.view.mockReturnValue(viewResponse)
  return { h, viewResponse }
}

describe('#catchAll', () => {
  describe('When response is not a Boom error', () => {
    test('Should return h.continue', () => {
      const { h } = mockToolkit()
      const request = mockRequest({ statusCode: statusCodes.ok })

      const result = catchAll(request, h)

      expect(result).toBe(h.continue)
    })
  })

  describe('When response is a 401 Unauthorized Boom error', () => {
    test('Should return the original response to preserve auth challenge headers', () => {
      const { h } = mockToolkit()
      const boom = Boom.unauthorized('Missing credentials')
      const request = mockRequest(boom)

      const result = catchAll(request, h)

      expect(result).toBe(boom)
      expect(h.view).not.toHaveBeenCalled()
    })
  })

  describe('When response is a 404 Not Found Boom error', () => {
    test('Should render the error view with "Page not found"', () => {
      const { h, viewResponse } = mockToolkit()
      const request = mockRequest(Boom.notFound())

      catchAll(request, h)

      expect(h.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Page not found',
        heading: statusCodes.notFound,
        message: 'Page not found'
      })
      expect(viewResponse.code).toHaveBeenCalledWith(statusCodes.notFound)
    })
  })

  describe('When response is a 403 Forbidden Boom error', () => {
    test('Should render the error view with "Forbidden"', () => {
      const { h, viewResponse } = mockToolkit()
      const request = mockRequest(Boom.forbidden())

      catchAll(request, h)

      expect(h.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Forbidden',
        heading: statusCodes.forbidden,
        message: 'Forbidden'
      })
      expect(viewResponse.code).toHaveBeenCalledWith(statusCodes.forbidden)
    })
  })

  describe('When response is a 400 Bad Request Boom error', () => {
    test('Should render the error view with "Bad Request"', () => {
      const { h, viewResponse } = mockToolkit()
      const request = mockRequest(Boom.badRequest())

      catchAll(request, h)

      expect(h.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Bad Request',
        heading: statusCodes.badRequest,
        message: 'Bad Request'
      })
      expect(viewResponse.code).toHaveBeenCalledWith(statusCodes.badRequest)
    })
  })

  describe('When response is a 500 Internal Server Error Boom error', () => {
    test('Should render the error view with "Something went wrong"', () => {
      const { h, viewResponse } = mockToolkit()
      const boom = Boom.internal('Unexpected failure')
      const logger = { error: vi.fn() }
      const request = mockRequest(boom, logger)

      catchAll(request, h)

      expect(h.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Something went wrong',
        heading: statusCodes.internalServerError,
        message: 'Something went wrong'
      })
      expect(viewResponse.code).toHaveBeenCalledWith(
        statusCodes.internalServerError
      )
    })

    test('Should log the error stack', () => {
      const { h } = mockToolkit()
      const boom = Boom.internal('Unexpected failure')
      const logger = { error: vi.fn() }
      const request = mockRequest(boom, logger)

      catchAll(request, h)

      expect(logger.error).toHaveBeenCalledWith(boom.stack)
    })
  })

  describe('When response is an unrecognised 4xx Boom error', () => {
    test('Should render the error view with "Something went wrong"', () => {
      const { h, viewResponse } = mockToolkit()
      const request = mockRequest(Boom.teapot())

      catchAll(request, h)

      expect(h.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Something went wrong',
        heading: statusCodes.imATeapot,
        message: 'Something went wrong'
      })
      expect(viewResponse.code).toHaveBeenCalledWith(statusCodes.imATeapot)
    })
  })
})
