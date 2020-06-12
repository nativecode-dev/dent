import { LincolnMessage } from './LincolnMessage.ts'

export interface LincolnLogTransform {
  (message: LincolnMessage): LincolnMessage
}
