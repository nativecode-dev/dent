import { ConnectorProtocols } from './ConnectorProtocols.ts'

export interface ConnectorOptions {
  name: string

  credentials?: {
    password: string
    username: string
  }

  endpoint: {
    host: string
    port?: number
    protocol?: ConnectorProtocols
  }
}
