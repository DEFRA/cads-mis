import { createApiClient } from '../../api-client.js'
/** @typedef {import('../../types/mibff/report.js').ReportListItem} ReportListItem */

/**
 * Fetch all reports for the authenticated user.
 *
 * @param {import('@hapi/hapi').Request} request
 * @returns {Promise<ReportListItem[]>}
 */
export function getUserReports(request) {
  const api = createApiClient(request)
  return api.get('/api/v1/bff/mi/reports')
}
