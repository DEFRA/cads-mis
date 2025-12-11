import path from 'path'
import fs from 'fs/promises'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const mocks = {
  plugin: {
    name: 'mocks',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/mocks',
          handler: (request, h) => {
            return h.view('mocks/index.njk', {
              pageTitle: 'Mocks',
              heading: 'Mocks'
            })
          }
        },
        {
          method: 'GET',
          path: '/mocks/{filename}',
          handler: async (request, h) => {
            const filename = request.params.filename
            const html = await fs.readFile(
              path.join(process.cwd(), 'src', 'server', 'mocks', filename),
              'utf8'
            )
            return h.response(html).type('text/html')
          }
        }
      ])
    }
  }
}
