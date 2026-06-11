export function buildNavigation(request) {
  const isAuthenticated = Boolean(request?.auth?.credentials)

  if (!isAuthenticated) {
    return []
  }

  return [
    {
      text: 'Home',
      href: '/',
      current: request?.path === '/'
    },
    {
      text: 'Dashboard',
      href: '/dashboard',
      current: request?.path === '/dashboard'
    },
    {
      text: 'Sign out',
      href: '/logout',
      current: false
    }
  ]
}
