import { CouchClient, DocumentStoreConfig } from '../deps.ts'

export class CouchStore implements CouchStore {
  protected readonly client: CouchClient

  constructor(options: DocumentStoreConfig) {
    this.client = new CouchClient(options.endpoint, {
      basicAuth: {
        username: options.auth.username,
        password: options.auth.password,
      },
    })
  }

  async create(name: string) {
    const result = await this.client.createDatabase(name)

    if (result.ok === false) {
      throw new Error(`could not create database: ${name}`)
    }
  }

  async delete(name: string) {
    const result = await this.client.deleteDatabase(name)

    if (result.ok === false) {
      throw new Error(`could not create database: ${name}`)
    }
  }
}
