import { ConnectorOptions } from '../../connector/mod.ts'

function normalize(value: string): string {
  if (value.startsWith('/') && value.endsWith('/')) {
    return value.slice(0, value.length - 1)
  }

  if (value.startsWith('/') === false && value.endsWith('/')) {
    return `/${value}`.slice(0, value.length)
  }

  return value
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
    const firstColon = url.indexOf(':')
    const firstDoubleSlash = url.indexOf('//') + 2
    const firstSlash = url.indexOf('/', firstDoubleSlash)
    const firstAt = url.indexOf('@')

    const [auth, hostpart] = url.slice(firstDoubleSlash, firstSlash).split('@')
    const [host, port] = url.slice(firstAt > -1 ? firstAt + 1 : firstDoubleSlash, firstSlash).split(':')
    const [path, query] = url.slice(firstSlash).split('?')
    const protocol = url.slice(0, firstColon)

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

    return new UrlBuilder(options)
  }

  build(authenticated: boolean = false): string {
    const urlparts = []

    urlparts.push(this.options.endpoint.protocol || 'http', '://')

    if (authenticated && this.options.credentials) {
      const username = this.options.credentials.username
      const password = this.options.credentials.password
      const auth = `${username}:${password}@`
      urlparts.push(auth)
    }

    urlparts.push(this.options.endpoint.host || 'localhost')

    if (this.options.endpoint.port) {
      urlparts.push(':' + this.options.endpoint.port)
    }

    if (this.options.endpoint.path) {
      urlparts.push(normalize(this.options.endpoint.path))
    }

    if (this.options.endpoint.query) {
      const query = Object.keys(this.options.endpoint.query)
        .map((key) => ({ key, value: this.options.endpoint.query![key] }))
        .map((keyvalue) => `${keyvalue.key}=${keyvalue.value}`)

      urlparts.push('?' + query.join('&'))
    }

    return urlparts.join('')
  }
}
