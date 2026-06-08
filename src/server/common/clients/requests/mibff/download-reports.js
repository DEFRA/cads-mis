import { createApiClient } from '../../api-client.js'

/**
 * Download report from the backend API.
 * Returns the raw Response (file stream), not parsed JSON.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {string} reportKey - The key identifying the report to download (e.g., 'cattle_registrations' or 'cattle_deaths')
 * @param {{ month: string, year: string, reportType: string }} params
 * @returns {Promise<Response>}
 */
export function downloadReport(request, reportKey, params) {
  const api = createApiClient(request)
  return api.post(`/api/v1/bff/mi/reports/${reportKey}`, params, true)
}
