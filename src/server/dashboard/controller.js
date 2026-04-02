// import { fetchReportsList } from './fetchReportsList.js'

export const dashboardController = {
  async handler(_request, h) {
    // const reports = await fetchReportsList('') //session.idToken)
    const reports = []

    return h.view('dashboard/index', {
      pageTitle: 'Dashboard',
      heading: 'Dashboard',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Dashboard'
        }
      ],
      viewModel: {
        reports
      }
    })
  }
}
