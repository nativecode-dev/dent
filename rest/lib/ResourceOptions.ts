import { ResourceHeader } from './ResourceHeader.ts'

export interface ResourceOptions {
  credentials?: 'omit' | 'same-origin' | 'include'
  headers: ResourceHeader[]
}
