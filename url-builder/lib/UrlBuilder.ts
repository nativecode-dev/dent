import { ConnectorOptions } from '../deps.ts'

function normalizeHostString(value: string | undefined): string {
  if (value) {
    return value
  }

  return 'localhost'
}

function normalizePathString(value: string): string {
  return value
    .split('/')
    .reduce<string[]>((result, current) => (current !== '' ? [...result, current] : result), [])
    .join('/')
}

function normalizePortNumber(value: number | string | undefined): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    return parseInt(value, 0)
  }

  return 443
}

function normalizePortString(value: number | string | undefined): string {
  return normalizePortNumber(value).toString()
}

function normalizeProtocolString(value: string | undefined): string {
  if (value) {
    if (value.endsWith(':')) {
      return value
    }

    return `${value}:`
  }

  return 'https:'
}

function normalizeQueryObject(value: any): string[] {
  return Object.keys(value)
    .map((key) => ({ key, value: value![key] }))
    .map((keyvalue) => `${keyvalue.key}=${keyvalue.value}`)
}

function normalizeQueryString(query: string | undefined): { [key: string]: string } | undefined {
  if (query) {
    return query.split('&').reduce<any>((result, current) => {
      const [name, value] = current.split('=')
      result[name] = value
      return result
    }, {})
  }

  return undefined
}

function parseConnectorOptions(url: string): ConnectorOptions {
  const builder = url
  const firstAt = builder.indexOf('@') + 1
  const firstColon = builder.indexOf(':')
  const firstDoubleSlash = builder.indexOf('//') + 2
  const firstSlash = builder.indexOf('/', firstDoubleSlash) > -1 ? builder.indexOf('/', firstDoubleSlash) : url.length

  const protocol = firstColon > -1 ? builder.slice(0, firstColon + 1) : 'https:'

  const [auth, hostpart] = builder.slice(firstDoubleSlash, firstSlash).split('@')
  const [host, port] = builder.slice(firstAt > 0 ? firstAt : firstDoubleSlash, firstSlash).split(':')
  const [path, query] = builder.slice(firstSlash).split('?')

  const options: ConnectorOptions = {
    endpoint: {
      host: normalizeHostString(host),
      path: normalizePathString(path),
      port: normalizePortNumber(port),
      protocol: normalizeProtocolString(protocol),
      query: normalizeQueryString(query),
    },
    name: 'test',
  }

  if (auth && hostpart) {
    const [username, password] = auth.split(':')
    options.credentials = { username, password }
  }

  return options
}

interface BuilderOptions {
  authenticated: boolean
  includePort: boolean
  trailingSlash: boolean
}

export class UrlBuilder {
  private readonly builder: BuilderOptions = {
    authenticated: false,
    includePort: false,
    trailingSlash: false,
  }

  constructor(private readonly options: ConnectorOptions) {}

  static parse(url: string): UrlBuilder {
    return new UrlBuilder(parseConnectorOptions(url))
  }

  withAuthentication() {
    this.builder.authenticated = true
    return this
  }

  withPort() {
    this.builder.includePort = true
    return this
  }

  withTralingSlash() {
    this.builder.trailingSlash = true
    return this
  }

  toURL(): URL {
    return new URL(this.toUrl())
  }

  toUrl(): string {
    return this.toUrlParts().join('')
  }

  toUrlParts(): string[] {
    const url = []

    const protocol = normalizeProtocolString(this.options.endpoint.protocol)
    url.push(protocol, '//')

    if (this.builder.authenticated && this.options.credentials) {
      const { password, username } = this.options.credentials
      const auth = password ? `${username}:${password}` : username
      url.push(auth)
      url.push('@')
    }

    url.push(normalizeHostString(this.options.endpoint.host))

    if (this.builder.includePort) {
      url.push(':')
      url.push(normalizePortString(this.options.endpoint.port))
    }

    url.push('/')

    if (this.options.endpoint.path) {
      url.push(normalizePathString(this.options.endpoint.path))
    }

    if (this.builder.trailingSlash) {
      url.push('/')
    }

    if (this.options.endpoint.query) {
      const query = normalizeQueryObject(this.options.endpoint.query)

      if (query.length > 0) {
        url.push('?')
        url.push(query.join('&'))
      }
    }

    return url
  }
}
