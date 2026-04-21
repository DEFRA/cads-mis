import { downloadController } from './controller.js'
import { authRequired } from '../../auth/auth-required.js'
import { requireRole } from '../../auth/require-role.js'
import { roleTypes } from '../../auth/constants/roles.js'

export const download = {
  plugin: {
    name: 'download',
    register(server) {
      server.route([
        {
          method: 'POST',
          path: '/download/{reportName}',
          options: {
            auth: {
              strategy: 'session',
              mode: 'try'
            },
            pre: [authRequired, requireRole(roleTypes.mipViewer)]
          },
          ...downloadController
        }
      ])
    }
  }
}
