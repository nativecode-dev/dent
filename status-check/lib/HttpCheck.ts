import { ConnectorOptions, UrlBuilder } from '../deps.ts'

import { StatusCheck } from './StatusCheck.ts'

export class HttpCheck implements StatusCheck {
  async available(options: ConnectorOptions): Promise<boolean> {
    try {
      const builder = new UrlBuilder(options)
      const url = builder.withAuthentication().withPort().toURL()
      const response = await fetch(url)
      return response.ok
    } catch {
      return false
    }
  }
}
