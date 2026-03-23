import { roleTypes } from './roles.js'
import { resourceScopes } from './resourceScopes.js'
import { uiPermissions } from './uiPermissions.js'

const rolePermissions = {
  [roleTypes.mipViewer]: [
    resourceScopes.cadsCds.reportsRead,
    uiPermissions.reports.view
  ]
}

export { rolePermissions }
