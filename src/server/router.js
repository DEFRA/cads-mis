import inert from '@hapi/inert'

import { home } from './home/index.js'
import { about } from './about/index.js'
import { health } from './health/index.js'

import { serveStaticFiles } from './common/helpers/serve-static-files.js'
import { mocks } from './mocks/index.js'
import { dashboard } from './dashboard/index.js'
import { holdingSummary } from './holding-summary/index.js'

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here
      await server.register([home, about, mocks, dashboard, holdingSummary])

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}
