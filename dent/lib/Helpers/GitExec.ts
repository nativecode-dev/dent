import { Essentials } from '../../deps.ts'

import { Exec } from './Exec.ts'

export interface GitOptions {
  executable: string
}

const GIT_PATH = await Exec('which git')

const decoder = new TextDecoder()

export const DefaultGitOptions: Essentials.DeepPartial<GitOptions> = {
  executable: GIT_PATH,
}

export function GitExec(command: string, ...args: string[]): Promise<string> {
  return Exec(command, ...args)
}
