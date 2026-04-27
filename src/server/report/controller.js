import Boom from '@hapi/boom'
import { reportPermissionTypes } from '../../auth/constants/permissions.js'
import { hasPermission } from '../../auth/permission-helper.js'
import { getUserReportPermissions } from '../common/clients/requests/mibff/get-user-report-permissions.js'
import { reportNames } from '../common/constants/report-names.js'

export const reportController = {
  handler: async (request, h) => {
    const reportKey = request.params.reportKey

    let reportPermissions
    try {
      /** @type {import('../common/clients/types/mibff/report-permission.js').ReportPermissionItem} */
      reportPermissions = await getUserReportPermissions(request, reportKey)
    } catch (err) {
      request.log(['error', 'report-permissions'], err)
      throw Boom.badGateway('Unable to fetch report permissions')
    }

    if (
      !hasPermission(reportPermissions.permissions, reportPermissionTypes.view)
    ) {
      throw Boom.forbidden()
    }

    const canExport = hasPermission(
      reportPermissions.permissions,
      reportPermissionTypes.export
    )

    const viewPath = reportKey.startsWith('gb_')
      ? `report/views/${reportKey}`
      : `report/mocks/${reportKey}`

    return h.view(viewPath, {
      pageTitle: 'Report',
      heading: 'Report',
      permissions: reportPermissions.permissions,
      canExport,
      breadcrumbs: [
        {
          text: 'Dashboard',
          href: '/dashboard'
        },
        {
          text: 'Report'
        }
      ],
      reportNames
    })
  }
}
