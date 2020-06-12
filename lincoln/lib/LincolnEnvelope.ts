import { LincolnMessage } from './LincolnMessage.ts'

export interface LincolnEnvelope {
  created: Date
  message: LincolnMessage
  scope: string
}
