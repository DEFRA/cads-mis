/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 */
export const holdingSummaryController = {
  handler(_request, h) {
    return h.view('holding-summary/index', {
      pageTitle: 'Holding Summary',
      heading: 'Holding Summary',
      breadcrumbs: [
        {
          text: 'Dashboard',
          href: '/dashboard'
        },
        {
          text: 'Holding Summary'
        }
      ]
    })
  }
}
