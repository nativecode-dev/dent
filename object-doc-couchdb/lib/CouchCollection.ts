import { Document, DocumentCollection, DocumentKey, CouchDatabase, Essentials, ObjectMerge } from '../deps.ts'

export class CouchCollection<T extends Document> implements DocumentCollection<T> {
  constructor(private readonly doctype: string, private readonly collection: CouchDatabase<T>) {
    this.collection = collection
  }

  async all(): Promise<T[]> {
    const selector = { selector: { doctype: this.doctype } }
    const options = { limit: Number.MAX_SAFE_INTEGER }
    const response = await this.collection.find<T>(selector, options)
    return response.docs || []
  }

  async delete(id: string, rev: string): Promise<void> {
    const response = await this.collection.delete(id, rev)

    if (response.ok === false) {
      throw new Error(`could not delete document with id: ${id}`)
    }
  }

  async get(id: string): Promise<T> {
    const document = await this.collection.get(id)
    return document as T
  }

  async update(document: Essentials.DeepPartial<T>, dockey: DocumentKey<T>): Promise<string> {
    const docid = { _id: dockey(document), doctype: this.doctype } as Essentials.DeepPartial<T>
    const doc = ObjectMerge.merge<T>(docid, document)
    const response = await this.collection.put(docid._id!, doc)

    if (response.ok === false) {
      throw new Error(`could not update document with id: ${docid._id!}`)
    }

    return docid._id!
  }
}
