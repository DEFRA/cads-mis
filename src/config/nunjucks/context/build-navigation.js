export function buildNavigation(request) {
  const isAuthenticated = Boolean(request?.auth?.credentials)

  if (!isAuthenticated) {
    return []
  }

  return [
    {
      text: 'Dashboard',
      href: '/dashboard',
      current: request?.path === '/dashboard'
    },
    {
      text: 'Administration',
      href: '/administration',
      current: request?.path === '/administration'
    },
    {
      text: 'Sign out',
      href: '/logout',
      current: false
    }
  ]
}
