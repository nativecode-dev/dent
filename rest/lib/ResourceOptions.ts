import { ConnectorOptions } from '../deps.ts'

import { ResourceHeader } from './ResourceHeader.ts'

export interface ResourceOptions {
  connection: ConnectorOptions
  credentials?: 'omit' | 'same-origin' | 'include'
  headers: ResourceHeader[]
}
