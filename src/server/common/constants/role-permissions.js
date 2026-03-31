import { roleTypes } from './roles.js'
import { resourceScopes } from './resource-scopes.js'
import { uiPermissions } from './permissions.js'

const rolePermissions = {
  [roleTypes.mipViewer]: [
    resourceScopes.cadsCds.reportsRead,
    uiPermissions.reports.view
  ]
}

export { rolePermissions }
