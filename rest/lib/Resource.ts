import { BError, Essentials, ObjectMerge, SysInfo, UrlBuilder } from '../deps.ts'

import { ResourceParams } from './ResourceParam.ts'
import { ResourceOptions } from './ResourceOptions.ts'
import { ResourceParamType } from './ResourceParamType.ts'

const DefaultOptions: Essentials.DeepPartial<ResourceOptions> = {
  headers: [
    {
      name: 'User-Agent',
      value: `rest-client/1.0 (${Deno.version.deno}/${Deno.version.typescript})`,
    },
  ],
}

export abstract class Resource<T extends ResourceOptions> {
  protected readonly encoder = new TextEncoder()
  protected readonly decoder = new TextDecoder()
  protected readonly options: T

  constructor(options: Essentials.DeepPartial<T>) {
    this.options = ObjectMerge.merge<T>(DefaultOptions as Essentials.DeepPartial<T>, options)
  }

  protected async http_get<T>(route: string, ...params: ResourceParams): Promise<T> {
    return this.json(route, 'GET', params)
  }

  protected async http_delete<R>(route: string, ...params: ResourceParams): Promise<R> {
    return this.json(route, 'DELETE', params)
  }

  protected async http_head(route: string, ...params: ResourceParams): Promise<Response> {
    return this.response(route, 'HEAD', params)
  }

  protected async http_options(route: string, ...params: ResourceParams): Promise<Response> {
    return this.response(route, 'OPTIONS', params)
  }

  protected async http_patch<T, R>(route: string, resource: T, ...params: ResourceParams): Promise<R> {
    return this.json(route, 'PATCH', params, resource)
  }

  protected async http_post<T, R>(route: string, resource: T, ...params: ResourceParams): Promise<R> {
    return this.json(route, 'POST', params, resource)
  }

  protected async http_put<T, R>(route: string, resource: T, ...params: ResourceParams): Promise<R> {
    return this.json(route, 'PUT', params, resource)
  }

  protected async http_trace(route: string, ...params: ResourceParams): Promise<Response> {
    return this.response(route, 'TRACE', params)
  }

  protected btoa(value: string): string {
    return btoa(value)
  }

  protected async blob(route: string, method: string, params: ResourceParams): Promise<ArrayBuffer | SharedArrayBuffer> {
    try {
      const response = await this.response(route, method, params)
      return response.arrayBuffer()
    } catch (error) {
      throw new BError('[error:blob]', error)
    }
  }

  protected buffer(route: string, method: string, params: ResourceParams) {
    return this.response(route, method, params)
  }

  protected async json<T, R>(route: string, method: string, params: ResourceParams, resource?: T): Promise<R> {
    try {
      const response = await this.response(route, method, params, resource)
      return response.json()
    } catch (error) {
      throw new BError('[error:json]', error)
    }
  }

  protected async response(route: string, method: string, params: ResourceParams = [], body?: any): Promise<Response> {
    const headers = this.headers(params)
    headers.append('x-deno-rest-hostname', SysInfo.hostname())
    headers.append('x-deno-rest-ipaddress', await SysInfo.ip_public())

    const url = this.getRoute(route, params).href

    const request: RequestInit = {
      headers,
      method,
      body: body ? JSON.stringify(body) : undefined,
    }

    try {
      const response = await fetch(url, request)

      if (response.ok === false) {
        throw new BError(response.statusText, undefined, { response, request })
      }

      return response
    } catch (error) {
      throw new BError('[error:response]', error, { request })
    }
  }

  protected setHeader(name: string, value: string): void {
    this.options.headers.push({ name, value })
  }

  protected async text(route: string, method: string, params: ResourceParams): Promise<string> {
    try {
      const response = await this.response(route, method, params)
      return response.text()
    } catch (error) {
      throw new BError('[error:text]', error)
    }
  }

  protected getRoute(route: string, params: ResourceParams = []): URL {
    const builder = new UrlBuilder({
      arguments: this.options.connection.arguments || {},
      credentials: this.options.connection.credentials,
      endpoint: {
        host: this.options.connection.endpoint.host,
        path: this.options.connection.endpoint.path,
        port: this.options.connection.endpoint.port,
        protocol: this.options.connection.endpoint.protocol,
        query: this.options.connection.endpoint.query,
      },
      name: this.options.connection.name,
    })

    const routeUrl = params
      .filter((param) => param.type === ResourceParamType.RouteParameter)
      .reduce((result, param) => {
        const regex = new RegExp(`{:${param.key}}`)
        return result.replace(regex, param.value)
      }, route)

    const query = params
      .filter((param) => param.type === ResourceParamType.Query)
      .filter((param) => param.value)
      .reduce<any>((obj, param) => {
        obj[param.key] = param.value
        return obj
      }, {})

    return builder.withPath(routeUrl).withPort().withQuery(query).toURL()
  }

  private headers(params: ResourceParams = []): Headers {
    const headers = new Headers()
    params.map((param) => headers.set(param.key, param.value))

    return this.options.headers.reduce((headers, current) => {
      headers.append(current.name, current.value)
      return headers
    }, headers)
  }
}
