import { BError, Essentials, IExecResponse, ObjectMerge, OutputMode, exec } from '../deps.ts'

export interface GitOptions {
  executable: string
}

const GIT_PATH = await exec('which git', { output: OutputMode.Capture })

const DefaultGitOptions: Essentials.DeepPartial<GitOptions> = {
  executable: GIT_PATH.output,
}

export async function gitexec(command: 'string', ...args: string[]): Promise<IExecResponse> {
  return await exec([command, ...args].join(' '), { output: OutputMode.Capture })
}

export class Git {
  private readonly options: GitOptions

  constructor(options: Essentials.DeepPartial<GitOptions> = {}) {
    this.options = ObjectMerge.merge<GitOptions>(DefaultGitOptions, options)
  }

  async branch() {
    return await this.execute('rev-parse --abbrev-ref HEAD')
  }

  async command(command: string): Promise<string> {
    return await this.execute(command)
  }

  async lasttag(): Promise<string> {
    return await this.execute('describe --tags --abbrev=0')
  }

  async push() {
    return await this.execute('push origin --tags')
  }

  async tag(version: string) {
    return await this.execute(`tag ${version}`)
  }

  async help(command?: string): Promise<string> {
    if (command) {
      const cmd = [this.options.executable, '--help'].join(' ')
      return await this.execute(cmd)
    }

    const cmd = [this.options.executable, command, '--help'].join(' ')
    return await this.execute(cmd)
  }

  private async execute(command: string): Promise<string> {
    const cmd = [this.options.executable, command].join(' ')
    const response = await exec(cmd, { output: OutputMode.Capture })

    if (response.status.success) {
      return response.output
    }

    throw new BError(`error executing ${command}: ${response.status.code}`)
  }
}
