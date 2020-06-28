import { Document } from './Document.ts'

export interface DocumentKey<T extends Document> {
  (doc: T): string
}
