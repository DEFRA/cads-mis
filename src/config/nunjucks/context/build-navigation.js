export function buildNavigation(request) {
  const isAuthenticated = Boolean(request?.auth?.credentials)

  const items = [
    {
      text: 'Home',
      href: '/',
      current: request?.path === '/'
    }
  ]

  if (isAuthenticated) {
    items.push({
      text: 'Dashboard',
      href: '/dashboard',
      current: request?.path === '/dashboard'
    })

    items.push({
      text: 'Sign out',
      href: '/logout',
      current: false
    })
  } else {
    items.push({
      text: 'Sign in',
      href: '/login',
      current: false
    })
  }

  return items
}
