import { ConnectorProtocols } from './ConnectorProtocols.ts'

export interface ConnectorOptions {
  arguments?: { [key: string]: any }
  name: string

  credentials?: {
    password: string
    username: string
  }

  endpoint: {
    host: string
    path?: string
    port?: number
    protocol?: ConnectorProtocols
  }
}
