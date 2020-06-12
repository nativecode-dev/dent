import { Essentials, ObjectMerge } from '../deps.ts'

import { Resource } from './Resource.ts'
import { ResourceOptions } from './ResourceOptions.ts'

const DefaultResourceOptions: Essentials.DeepPartial<ResourceOptions> = {
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
  constructor(url: URL, options: Essentials.DeepPartial<ResourceOptions> = {}) {
    super(url, ObjectMerge.merge<ResourceOptions>(DefaultResourceOptions, options))
  }
}
