import { getUserReports } from '../common/clients/requests/mibff/get-user-reports.js'

export const dashboardController = {
  async handler(request, h) {
    const reports = await getUserReports(request)

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
