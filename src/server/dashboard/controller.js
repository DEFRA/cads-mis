/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 */
export const dashboardController = {
  handler(_request, h) {
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
      ]
    })
  }
}
