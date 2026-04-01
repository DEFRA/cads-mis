import { getConfig } from '../../config/config.js'

function buildCadsCdsScopes(cadsCdsClientId, useSimpleScopes) {
  return useSimpleScopes
    ? ['reports.read']
    : [`api://${cadsCdsClientId}/reports.read`]
}

export function getAuthConfig() {
  const config = getConfig()
  const cadsCdsClientId = config.get('azure.cadsCdsClientId')
  const useSimpleScopes = config.get('azure.useSimpleScopes')
  const cadsCdsScopes = buildCadsCdsScopes(cadsCdsClientId, useSimpleScopes)

  return {
    clientId: config.get('oidc.clientId'),
    clientSecret: config.get('oidc.clientSecret'),
    redirectUri: config.get('oidc.redirectUri'),
    postLogoutRedirectUri: config.get('oidc.postLogoutRedirectUri'),
    defaultRedirect: config.get('oidc.postLoginDefaultRedirectUri'),
    oidcWellKnownUrl: config.get('oidc.wellKnownUrl'),
    externalAuthorizeEndpoint: config.get('oidc.externalAuthorizeEndpoint'),
    scope: [
      'openid',
      'profile',
      'email',
      'offline_access',
      ...cadsCdsScopes
    ].join(' ')
  }
}
