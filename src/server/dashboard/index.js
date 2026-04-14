import { dashboardController } from './controller.js'
import { roleTypes } from '../../auth/constants/roles.js'
import { requireRole } from '../../auth/require-role.js'
import { authRequired } from '../../auth/auth-required.js'

/**
 * Sets up the routes used in the /about page.
 * These routes are registered in src/server/router.js.
 */
export const dashboard = {
  plugin: {
    name: 'dashboard',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/dashboard',
          options: {
            auth: {
              strategy: 'session',
              mode: 'try'
            },
            pre: [authRequired, requireRole(roleTypes.mipViewer)]
          },
          ...dashboardController
        }
      ])
    }
  }
}
