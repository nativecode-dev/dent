import { BError, IExecResponse, OutputMode, exec } from '../../deps.ts'

export interface GitOptions {
  executable: string
}

const GIT_PATH = await exec('which git', { output: OutputMode.Capture })

export async function gitexec(command: 'string', ...args: string[]): Promise<IExecResponse> {
  const response = await exec([GIT_PATH, command, ...args].join(' '), { output: OutputMode.Capture })

  if (response.status.success) {
    return response
  }

  throw new BError('command failed', undefined, { response })
}
