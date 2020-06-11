export interface DocumentStoreConfig {
  [key: string]: any

  auth: {
    password: string
    username: string
  }

  endpoint: string
  options: { [key: string]: any }
}
