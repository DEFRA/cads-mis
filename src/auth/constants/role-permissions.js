import { roleTypes } from '#auth/constants/roles.js'
import { resourceScopes } from '#auth/constants/resource-scopes.js'
import { uiPermissions } from '#auth/constants/permissions.js'

const rolePermissions = {
  [roleTypes.mipViewer]: [
    resourceScopes.cadsCds.reportsRead,
    uiPermissions.reports.view
  ]
}

export { rolePermissions }
