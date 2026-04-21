export function hasPermission(perms, key) {
  if (!perms) return false
  if (!key) return false
  return perms.includes(key)
}
