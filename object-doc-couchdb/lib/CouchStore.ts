import { ConnectorOptions, CouchClient, Document, DocumentCollection, ConnectorHelpers } from '../deps.ts'

import { CouchCollection } from './CouchCollection.ts'

export class CouchStore implements CouchStore {
  protected readonly client: CouchClient

  constructor(options: ConnectorOptions) {
    this.client = new CouchClient(ConnectorHelpers.buildUrl(options))
  }

  async collection<T extends Document>(name: string, doctype: string): Promise<DocumentCollection<T>> {
    const collection = this.client.database<T>(name)
    return new CouchCollection(doctype, collection)
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
