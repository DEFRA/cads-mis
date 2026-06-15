import { administrationController } from './controller.js'
import { authRequired } from '../../auth/auth-required.js'

export const administration = {
  plugin: {
    name: 'administration',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/administration',
          options: {
            auth: {
              strategy: 'session',
              mode: 'try'
            },
            pre: [authRequired]
          },
          ...administrationController
        }
      ])
    }
  }
}
