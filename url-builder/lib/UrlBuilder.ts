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

  const protocol = builder.slice(0, firstColon)

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

export class UrlBuilder {
  constructor(private readonly options: ConnectorOptions) {}

  static parse(url: string): UrlBuilder {
    return new UrlBuilder(parseConnectorOptions(url))
  }

  toUrl(authenticated: boolean = false, trailingSlash: boolean = false): string {
    const url = []

    url.push(this.options.endpoint.protocol || 'http', '://')

    if (authenticated && this.options.credentials) {
      const { password, username } = this.options.credentials
      const auth = password ? `${username}:${password}` : username
      url.push(auth)
      url.push('@')
    }

    url.push(this.options.endpoint.host || 'localhost')

    if (this.options.endpoint.port) {
      url.push(':' + this.options.endpoint.port)
    }

    url.push('/')

    if (this.options.endpoint.path) {
      url.push(normalize(this.options.endpoint.path))
    }

    if (trailingSlash) {
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

    return url.join('')
  }
}
