export const reportController = {
  handler: async (request, h) => {
    const filename = request.params.filename
    const viewPath = filename.startsWith('gb_')
      ? `report/views/${filename}`
      : `report/mocks/${filename}`
    const breadcrumbText = filename.startsWith('gb_')
      ? 'Download report'
      : 'View report'

    return h.view(viewPath, {
      pageTitle: 'Report',
      heading: 'Report',
      breadcrumbs: [
        {
          text: 'Dashboard',
          href: '/dashboard'
        },
        {
          text: breadcrumbText
        }
      ]
    })
  }
}
