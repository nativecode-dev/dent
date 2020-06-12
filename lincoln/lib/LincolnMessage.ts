import { LincolnMessageType } from './LincolnMessageType.ts'

export interface LincolnMessage {
  body: any
  parameters: Array<Date | number | string>
  type: LincolnMessageType
}
