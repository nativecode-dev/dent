import { Essentials } from '../deps.ts'
import { Document } from './Document.ts'

export interface DocumentKey<T extends Document> {
  (doc: Essentials.DeepPartial<T>): string
}
