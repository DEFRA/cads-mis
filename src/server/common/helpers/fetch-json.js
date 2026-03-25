import Boom from '@hapi/boom'

import { config } from '#config/config.js'
import { withTraceId } from '@defra/hapi-tracing'
import { getTracingHeaderName } from './request-tracing.js'

/**
 * Fetch JSON from a given url
 * @param {string} url
 * @param {RequestInit} [options] - Fetch API options (method, headers, body, etc.)
 * @returns {Promise<object>} The parsed JSON response or throws a Boom error
 */
export const fetchJson = async (url, options) => {
  const completeOptions = {
    ...options,
    headers: withTraceId(getTracingHeaderName(), {
      ...options?.headers,
      'Content-Type': 'application/json'
    })
  }

  try {
    const response = await fetch(url, completeOptions)

    if (!response.ok) {
      const error = Boom.boomify(
        new Error(
          `Failed to fetch from url: ${url}: ${response.status} ${response.statusText}`
        ),
        { statusCode: response.status }
      )

      if (response.headers.get('content-type')?.includes('application/json')) {
        error.output.payload = await response.json()
      }

      throw error
    }

    return await response.json()
  } catch (error) {
    if (error.isBoom) {
      throw error
    }

    throw Boom.internal(`Failed to fetch from url: ${url}: ${error.message}`)
  }
}

/**
 * Fetch JSON from a given path in the backend service.
 * @param {string} path - The API path to append to the backend URL
 * @param {RequestInit} [options] - Fetch API options (method, headers, body, etc.)
 * @returns {Promise<object>} The parsed JSON response or throws a Boom error
 */
export const fetchJsonFromBackend = async (path, options) => {
  const url = new URL(path, config.get('cadsBackendUrl')).href

  return fetchJson(url, options)
}
