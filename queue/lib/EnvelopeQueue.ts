import { BasicDeliver, BasicProperties } from '../deps.ts'

import { Envelope } from './Envelope.ts'

export interface EnvelopeQueue<T> extends Envelope<T> {
  args: BasicDeliver
  props: BasicProperties
}
