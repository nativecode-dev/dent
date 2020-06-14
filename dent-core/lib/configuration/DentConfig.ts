import { DentIgnore } from './DentIgnore.ts'
import { DentExtensions } from './DentExtensions.ts'

export interface DentConfig {
  extends: string[]
  extensions: DentExtensions
  ignore: DentIgnore
  permissions: string[]
  sync: { [key: string]: boolean }
}
