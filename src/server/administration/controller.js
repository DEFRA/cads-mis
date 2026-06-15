export const administrationController = {
  handler(_request, h) {
    return h.view('administration/index', {
      pageTitle: 'Administration',
      heading: 'Administration',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Administration'
        }
      ]
    })
  }
}
