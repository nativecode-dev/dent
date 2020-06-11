import { DocumentCollection, CouchClient } from './deps.ts'
import { Document } from './deps.ts'

export class CouchCollection<T extends Document> implements DocumentCollection<T> {
  constructor(private readonly name: string, private readonly client: CouchClient) {}

  async all() {
    const database = this.client.database(this.name)
    const response = await database.find<T>({ meta: this.name }, { limit: Number.MAX_SAFE_INTEGER })
    return response.docs
  }
}
