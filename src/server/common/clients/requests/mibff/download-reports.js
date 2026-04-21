import { createApiClient } from '../../api-client.js'

/**
 * Download cattle registrations report from the backend API.
 * Returns the raw Response (file stream), not parsed JSON.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {{ month: string, year: string, reportType: string }} params
 * @returns {Promise<Response>}
 */
export function downloadCattleRegistrations(request, params) {
  const api = createApiClient(request)
  return api.post('/api/v1/bff/mi/reports/cattle_registrations', params, true)
}
