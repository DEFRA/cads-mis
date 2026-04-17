// The files: relativeTo to is required to stub the download endpoint for the report generation feature.
// This endpoint will be used to download the generated report files.
// The controller will handle the logic for serving the correct file based on the report name provided in the URL.

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { downloadController } from './controller.js'

const _dirname = path.dirname(fileURLToPath(import.meta.url))

export const download = {
  plugin: {
    name: 'download',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/download/{reportName}',
          options: {
            auth: false,
            files: {
              relativeTo: _dirname
            }
          },
          ...downloadController
        }
      ])
    }
  }
}
