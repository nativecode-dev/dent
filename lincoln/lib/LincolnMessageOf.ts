import { LincolnMessage } from './LincolnMessage.ts'

export interface LincolnMessageOf<T> extends LincolnMessage {
  body: T
}
