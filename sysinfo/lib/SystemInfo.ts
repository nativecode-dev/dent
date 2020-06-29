export function getHost(fullhost: boolean = false): string {
  const hostname = Deno.env.get('HOST') || Deno.hostname() || 'localhost'

  if (fullhost) {
    return hostname
  }

  return hostname.split('.').slice(0, 1).join('')
}
