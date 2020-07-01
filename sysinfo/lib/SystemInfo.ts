import { getIP, getNetworkAddr } from '../deps.ts'

export namespace SysInfo {
  export function hostname(fullhost: boolean = false): string {
    const hostname = Deno.env.get('HOST') || Deno.env.get('HOSTNAME') || Deno.hostname() || 'localhost'

    if (fullhost) {
      return hostname
    }

    return hostname.split('.').slice(0, 1).join('')
  }

  export function ip_private(): Promise<string | undefined> {
    return getNetworkAddr()
  }

  export function ip_public(): Promise<string> {
    return getIP()
  }
}
