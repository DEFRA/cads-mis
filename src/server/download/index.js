import { downloadController } from './controller.js'
import { authRequired } from '../../auth/auth-required.js'

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
            pre: [authRequired]
          },
          ...downloadController
        }
      ])
    }
  }
}
