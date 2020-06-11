import { ObjectMerge } from './deps.ts'

import { Resource } from './Resource.ts'
import { ResourceOptions } from './ResourceOptions.ts'

const DefaultResourceOptions: Partial<ResourceOptions> = {
  headers: [
    {
      name: 'Accept',
      value: 'application/json',
    },
    {
      name: 'Content-Type',
      value: 'application/json',
    },
  ],
}

export abstract class RestResource extends Resource {
  constructor(url: URL, options: Partial<ResourceOptions> = {}) {
    super(url, ObjectMerge.merge<ResourceOptions>(DefaultResourceOptions, options))
  }
}
