import { Essentials } from '../deps.ts'

import { Document } from './Document.ts'
import { DocumentSelector } from './DocumentSelector.ts'
import { DocumentKeySelector } from './DocumentKeySelector.ts'
import { DocumentFindOptions } from './DocumentFindOptions.ts'

export interface DocumentCollection<T extends Document> {
  all(): Promise<T[]>
  delete(id: string, ...args: any[]): Promise<void>
  find(selector: DocumentSelector, options: DocumentFindOptions): Promise<T[]>
  get(id: string): Promise<T | null>
  update(document: Essentials.DeepPartial<T>, dockey: DocumentKeySelector<T>): Promise<T>
}

export const DocumentCollectionKey: symbol = Symbol('DocumentCollection')
