import { Essentials, ObjectMerge } from '../deps.ts'

import { HttpError } from './HttpError.ts'
import { ResourceParams } from './ResourceParam.ts'
import { ResourceOptions } from './ResourceOptions.ts'
import { ResourceParamType } from './ResourceParamType.ts'

const DefaultOptions: ResourceOptions = {
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
  protected readonly url: URL

  constructor(url: URL, options: Essentials.DeepPartial<T>) {
    this.options = ObjectMerge.merge<T>(DefaultOptions as Essentials.DeepPartial<T>, options)

    if (url.href.endsWith('/')) {
      this.url = url
    } else {
      this.url = new URL(`${url.href}/`)
    }
  }

  public get base(): URL {
    return this.url
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
    const response = await this.response(route, method, params)
    return response.arrayBuffer()
  }

  protected buffer(route: string, method: string, params: ResourceParams) {
    return this.response(route, method, params)
  }

  protected async json<T, R>(route: string, method: string, params: ResourceParams, resource?: T): Promise<R> {
    const response = await this.response(route, method, params, resource)
    return response.json()
  }

  protected async response(route: string, method: string, params: ResourceParams = [], body?: any): Promise<Response> {
    try {
      const headers = this.headers(params)
      const url = this.getRoute(route, params).href

      const request: RequestInit = {
        headers,
        method,
        body: body ? this.encoder.encode(JSON.stringify(body)) : undefined,
      }

      const response = await fetch(url, request)

      if (response.ok === false) {
        const error = new HttpError(request, response)
        throw error
      }

      return response
    } catch (error) {
      throw error
    }
  }

  protected setHeader(name: string, value: string): void {
    this.options.headers.push({ name, value })
  }

  protected async text(route: string, method: string, params: ResourceParams): Promise<string> {
    const response = await this.response(route, method, params)
    return response.text()
  }

  protected getRoute(route: string, params: ResourceParams = []): URL {
    const routeUrl = params
      .filter((param) => param.type === ResourceParamType.RouteParameter)
      .reduce((result, param) => {
        const regex = new RegExp(`{:${param.key}}`)
        return result.replace(regex, param.value)
      }, this.getUrl(route))

    const url = new URL(routeUrl)

    url.search = params
      .filter((param) => param.type === ResourceParamType.Query)
      .filter((param) => param.value)
      .reduce<string[]>((result, param) => {
        result.push(`${param.key}=${param.value}`)
        return result
      }, [])
      .join('&')

    return url
  }

  protected getUrl(route: string): string {
    if (route.startsWith('http')) {
      return route
    }

    return route.startsWith('/') ? `${this.base.href}${route.substring(1)}` : `${this.base.href}${route}`
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
