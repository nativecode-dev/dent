import { Args } from '../deps.ts'

export interface DentOptions extends Args {
  'dry-run'?: boolean
  silent: boolean
}
