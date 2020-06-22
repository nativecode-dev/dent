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
    protocol?: string
    query?: { [key: string]: string }
  }
}
