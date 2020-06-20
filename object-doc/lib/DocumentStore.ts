import { Document } from './Document.ts'
import { DocumentCollection } from './DocumentCollection.ts'

export interface DocumentStore {
  collection<T extends Document>(): Promise<DocumentCollection<T>>
  create(name: string): Promise<void>
  delete(name: string): Promise<void>
}
