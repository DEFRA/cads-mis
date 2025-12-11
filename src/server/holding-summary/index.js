import { holdingSummaryController } from './controller.js'

/**
 * Sets up the routes used in the /about page.
 * These routes are registered in src/server/router.js.
 */
export const holdingSummary = {
  plugin: {
    name: 'movementSummary',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/holding-summary',
          ...holdingSummaryController
        }
      ])
    }
  }
}
