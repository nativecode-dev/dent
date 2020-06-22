import { ConnectorOptions } from '../deps.ts'

function normalize(value: string): string {
  return value
    .split('/')
    .reduce<string[]>((result, current) => (current !== '' ? [...result, current] : result), [])
    .join('/')
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
      host,
      path,
      port: parseInt(port, 0),
      protocol,
      query: queryFromString(query),
    },
    name: 'test',
  }

  if (auth && hostpart) {
    const [username, password] = auth.split(':')
    options.credentials = { username, password }
  }

  return options
}

function queryFromString(query: string | undefined): { [key: string]: string } | undefined {
  if (query) {
    return query.split('&').reduce<any>((result, current) => {
      const [name, value] = current.split('=')
      result[name] = value
      return result
    }, {})
  }

  return undefined
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

  toUrl(): string {
    return this.toUrlParts().join('')
  }

  toUrlParts(): string[] {
    const url = []

    url.push(this.options.endpoint.protocol || 'https:', '//')

    if (this.builder.authenticated && this.options.credentials) {
      const { password, username } = this.options.credentials
      const auth = password ? `${username}:${password}` : username
      url.push(auth)
      url.push('@')
    }

    url.push(this.options.endpoint.host || 'localhost')

    if (this.builder.includePort) {
      url.push(':')
      url.push((this.options.endpoint.port || (this.options.endpoint.protocol === 'https:' ? 443 : 80)).toString())
    }

    url.push('/')

    if (this.options.endpoint.path) {
      url.push(normalize(this.options.endpoint.path))
    }

    if (this.builder.trailingSlash) {
      url.push('/')
    }

    if (this.options.endpoint.query) {
      const query = Object.keys(this.options.endpoint.query)
        .map((key) => ({ key, value: this.options.endpoint.query![key] }))
        .map((keyvalue) => `${keyvalue.key}=${keyvalue.value}`)

      if (query.length > 0) {
        url.push('?')
        url.push(query.join('&'))
      }
    }

    return url
  }
}
