export const reports = {
  plugin: {
    name: 'reports',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/report/{filename}',
          handler: async (request, h) => {
            let filename = request.params.filename
            return h.view(`report/mocks/${filename}`, {
              pageTitle: 'Report',
              heading: 'Report'
            })
          }
        }
      ])
    }
  }
}
