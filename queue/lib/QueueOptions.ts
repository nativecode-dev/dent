import { QueueDeclareArgs } from '../deps.ts'

export interface QueueOptions extends QueueDeclareArgs {
  subject: string
}
