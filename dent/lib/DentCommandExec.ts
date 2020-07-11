import { DentOptions } from './DentOptions.ts'

export type DentCommandExec = (args: DentOptions) => Promise<string | undefined | void>
