import { ConnectorOptions, Essentials, ObjectMerge, join } from '../deps.ts'

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

function normalizePortNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && /[\d]+/g.test(value)) {
    return parseInt(value, 0)
  }
}

function normalizePortString(value: number | string | undefined): string {
  const normalized = normalizePortNumber(value)

  if (normalized) {
    return normalized.toString()
  }

  return value?.toString() || ''
}

function normalizeProtocolString(value: string | undefined, port?: number): string {
  const { standard, protocol } = isStandardPort(port)

  if (standard) {
    return protocol
  }

  if (value && value.endsWith(':')) {
    return value
  }

  if (value) {
    return `${value}:`
  }

  return ''
}

function isStandardPort(port: number | undefined): { standard: boolean; protocol: string } {
  if (port === 21) {
    return { standard: true, protocol: 'ftp:' }
  }

  if (port === 22) {
    return { standard: true, protocol: 'ssh:' }
  }

  if (port === 80) {
    return { standard: true, protocol: 'http:' }
  }

  if (port === 443) {
    return { standard: true, protocol: 'https:' }
  }

  return { standard: false, protocol: '' }
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
  const firstDoubleSlash = builder.indexOf('//') > -1 ? builder.indexOf('//') + 2 : 0
  const firstSlash = builder.indexOf('/', firstDoubleSlash) > -1 ? builder.indexOf('/', firstDoubleSlash) : url.length

  const [auth, hostpart] = builder.slice(firstDoubleSlash, firstSlash).split('@')
  const [host, port] = builder.slice(firstAt > 0 ? firstAt : firstDoubleSlash, firstSlash).split(':')
  const [path, query] = builder.slice(firstSlash).split('?')

  const protocol = normalizeProtocolString(url.slice(0, firstDoubleSlash > 0 ? firstDoubleSlash - 2 : firstColon))

  const options: ConnectorOptions = {
    endpoint: {
      host: normalizeHostString(host),
      path: normalizePathString(path),
      port: normalizePortNumber(port),
      protocol,
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

  private readonly options: ConnectorOptions

  constructor(options: Essentials.DeepPartial<ConnectorOptions>) {
    this.options = ObjectMerge.merge<ConnectorOptions>({}, options)
  }

  static parse(url: string): UrlBuilder {
    return new UrlBuilder(UrlBuilder.parseConnectorOptions(url))
  }

  static parseConnectorOptions(url: string): ConnectorOptions {
    return parseConnectorOptions(url)
  }

  withAuthentication() {
    if (this.options.credentials) {
      const hasPassword = typeof this.options.credentials.password === 'string'
      const hasUsername = typeof this.options.credentials.username === 'string'
      this.builder.authenticated = hasPassword || hasUsername
    }

    return this
  }

  withPath(path: string) {
    this.options.endpoint = {
      ...this.options.endpoint,
      path: this.options.endpoint.path ? join(this.options.endpoint.path, normalizePathString(path)) : path,
    }

    return this
  }

  withPort() {
    this.builder.includePort = true
    return this
  }

  withQuery(query: any) {
    this.options.endpoint = { ...this.options.endpoint, query: ObjectMerge.merge({}, this.options.endpoint.query, query) }
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
    const { standard } = isStandardPort(this.options.endpoint.port)

    const protocol = normalizeProtocolString(this.options.endpoint.protocol, this.options.endpoint.port)

    if (protocol !== ':' && protocol !== '') {
      url.push(protocol, '//')
    }

    if (this.builder.authenticated && this.options.credentials) {
      const { password, username } = this.options.credentials
      const auth = password ? `${username}:${password}` : username
      url.push(auth)
      url.push('@')
    }

    url.push(normalizeHostString(this.options.endpoint.host))

    if (this.builder.includePort && standard === false && this.options.endpoint.port) {
      url.push(':')
      url.push(normalizePortString(this.options.endpoint.port))
    }

    if (this.options.endpoint.path) {
      url.push('/')
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
