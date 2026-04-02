import { fetchJsonFromBackend } from '#helpers/fetch-json-from-backend.js'

/**
 * Fetches available reports for logged in user
 * @param {string} idToken
 * @returns {Promise<ReportListItem[]>}
 */
export async function fetchReportsList(idToken) {
  const path = '/api/v1/bff/mi/reports'

  return fetchJsonFromBackend(path, {
    method: 'GET',
    headers: { Authorization: `Basic ${idToken}` }
  })
}

/**
 * @typedef {{
 *   reportId: string,
 *   reportKey: string,
 *   title: string,
 *   description: string,
 *   isActive: boolean
 * }} ReportListItem
 */
