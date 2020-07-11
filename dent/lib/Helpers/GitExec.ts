import { BError, Essentials, IExecResponse, OutputMode, exec } from '../../deps.ts'

export interface GitOptions {
  executable: string
}

const GIT_PATH = await exec('which git', { output: OutputMode.Capture })

export const DefaultGitOptions: Essentials.DeepPartial<GitOptions> = {
  executable: GIT_PATH.output,
}

export async function GitExec(command: string, ...args: string[]): Promise<IExecResponse> {
  const cmd = [GIT_PATH.output, command, ...args].join(' ')
  const response = await exec(cmd, { output: OutputMode.Capture })

  if (response.status.success) {
    return response
  }

  throw new BError('command failed', undefined, { response })
}
