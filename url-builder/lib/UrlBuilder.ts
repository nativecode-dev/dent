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

function queryFromString(query: string | undefined): { [key: string]: string } {
  const queryobj = {}

  if (query) {
    query.split('&').reduce<any>((result, current) => {
      const [name, value] = current.split('=')
      result[name] = value
      return result
    }, queryobj)
  }

  return queryobj
}

export class UrlBuilder {
  constructor(private readonly options: ConnectorOptions) {}

  static parse(url: string): UrlBuilder {
    const firstColon = url.indexOf(':')
    const firstDoubleSlash = url.indexOf('//') + 2
    const firstSlash = url.indexOf('/', firstDoubleSlash)

    const [host, port] = url.slice(firstDoubleSlash, firstSlash).split(':')
    const [path, query] = url.slice(firstSlash).split('?')
    const protocol = url.slice(0, firstColon)

    const options = {
      endpoint: {
        host,
        path,
        port: parseInt(port, 0),
        protocol,
        query: queryFromString(query),
      },
      name: 'test',
    }

    return new UrlBuilder(options)
  }

  build(): string {
    const baseurl = [this.options.endpoint.protocol || 'http', '://', this.options.endpoint.host || 'localhost']

    if (this.options.endpoint.port) {
      baseurl.push(':' + this.options.endpoint.port)
    }

    if (this.options.endpoint.path) {
      baseurl.push(normalize(this.options.endpoint.path))
    }

    if (this.options.endpoint.query) {
      const query = Object.keys(this.options.endpoint.query)
        .map((key) => ({ key, value: this.options.endpoint.query![key] }))
        .map((keyvalue) => `${keyvalue.key}=${keyvalue.value}`)

      baseurl.push('?' + query.join('&'))
    }

    return baseurl.join('')
  }
}
