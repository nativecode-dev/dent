export interface DocumentStore {
  create(name: string): Promise<void>
  delete(name: string): Promise<void>
}
