import { ConnectorOptions } from './ConnectorOptions.ts'

export namespace ConnectorHelpers {
  export function buildUrl(options: ConnectorOptions) {
    const host = options.endpoint.host
    const password = options.credentials?.password
    const protocol = options.endpoint.protocol
    const port = options.endpoint.port
    const username = options.credentials?.username
    return `${protocol}://${username}:${password}@${host}:${port}`
  }
}
