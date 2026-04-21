import { createApiClient } from '../../api-client.js'
/** @typedef {import('../../types/mibff/report-permission.js').ReportPermissionItem} ReportPermissionItem */

/**
 * Fetch report permissions for the authenticated user.
 *
 * @param {import('@hapi/hapi').Request} request
 * @returns {Promise<ReportPermissionItem>}
 */
export function getUserReportPermissions(request, reportKey) {
  const api = createApiClient(request)
  return api.get(`/api/v1/bff/mi/reports/${reportKey}/permissions`)
}
