import { reportController } from './controller.js'
import { authRequired } from '../../auth/auth-required.js'

export const reports = {
  plugin: {
    name: 'reports',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/report/{reportKey}',
          options: {
            auth: {
              strategy: 'session',
              mode: 'try'
            },
            pre: [authRequired]
          },
          ...reportController
        }
      ])
    }
  }
}
