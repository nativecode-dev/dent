import { Document } from './Document.ts'
import { DocumentCollection } from './DocumentCollection.ts'

export interface DocumentStore {
  collection<T extends Document>(name: string, doctype: string): DocumentCollection<T>
  create(name: string): Promise<void>
  delete(name: string): Promise<void>
  exists(name: string): Promise<boolean>
}

export const DocumentStoreKey: symbol = Symbol('DocumentStore')
