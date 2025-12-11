/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const mocksController = {
  handler(_request, h) {
    return h.view('mocks/index', {
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
