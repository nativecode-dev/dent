import { Document } from './Document.ts'

export interface DocumentKeySelector<T extends Document> {
  (doc: T): string
}
