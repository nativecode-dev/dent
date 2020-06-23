import { Essentials } from '../deps.ts'

import { Document } from './Document.ts'
import { DocumentKey } from './DocumentKey.ts'

export interface DocumentCollection<T extends Document> {
  all(): Promise<T[]>
  delete(id: string, ...args: any[]): Promise<void>
  get(id: string): Promise<T>
  update(document: Essentials.DeepPartial<T>, dockey: DocumentKey<T>): Promise<string>
}

export const DocumentCollectionKey: symbol = Symbol('DocumentCollection')
