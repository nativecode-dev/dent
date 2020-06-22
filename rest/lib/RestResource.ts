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

export abstract class RestResource<T extends ResourceOptions> extends Resource<T> {
  constructor(url: URL, options: Essentials.DeepPartial<T>) {
    super(url, ObjectMerge.merge<T>({ ...DefaultResourceOptions } as Essentials.DeepPartial<T>, options) as Essentials.DeepPartial<T>)
  }
}
