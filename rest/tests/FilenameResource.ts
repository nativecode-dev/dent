import { RestResource } from '../lib/RestResource.ts'
import { ResourceParamType } from '../lib/ResourceParamType.ts'

export class FilenameResource extends RestResource {
  filename(filename: string) {
    return this.http_get<any>('/', {
      key: 'filename',
      type: ResourceParamType.Query,
      value: filename,
    })
  }
}
