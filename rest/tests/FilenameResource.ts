import { RestResource } from '../lib/RestResource.ts'
import { ResourceOptions } from '../lib/ResourceOptions.ts'
import { ResourceParamType } from '../lib/ResourceParamType.ts'

export class FilenameResource extends RestResource<ResourceOptions> {
  filename(filename: string) {
    return this.http_get<any>('/', {
      key: 'filename',
      type: ResourceParamType.Query,
      value: filename,
    })
  }
}
