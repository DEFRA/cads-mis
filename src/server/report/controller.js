export const reportController = {
  handler: async (request, h) => {
    const filename = request.params.filename
    return h.view(`report/mocks/${filename}`, {
      pageTitle: 'Report',
      heading: 'Report',
      breadcrumbs: [
        {
          text: 'Dashboard',
          href: '/dashboard'
        },
        {
          text: 'View report'
        }
      ]
    })
  }
}
