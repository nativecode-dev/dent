import { Document } from './Document.ts'

export interface DocumentCollection<T extends Document> {
  all(): Promise<T[]>
}
