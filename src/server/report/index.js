import { reportController } from './controller.js'

export const reports = {
  plugin: {
    name: 'reports',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/report/{filename}',
          config: {
            auth: false
          },
          ...reportController
        }
      ])
    }
  }
}
