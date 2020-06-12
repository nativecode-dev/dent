import { LincolnMessageOf } from './LincolnMessageOf.ts'
import { LincolnMessageType } from './LincolnMessageType.ts'

export function createMessage<T>(message: T, type: LincolnMessageType, attributes: any[] = []): LincolnMessageOf<T> {
  return { parameters: attributes, body: message, type }
}
