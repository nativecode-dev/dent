import { DentCommandExec } from './DentCommandExec.ts'

export interface DentCommand {
  [key: string]: DentCommandExec
}
