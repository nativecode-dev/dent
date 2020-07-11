import { BError, Essentials, ObjectMerge, OutputMode, exec } from '../deps.ts'

export interface GitOptions {
  executable: string
}

const GIT_PATH = await exec('which git', { output: OutputMode.Capture })

const DefaultGitOptions: Essentials.DeepPartial<GitOptions> = {
  executable: GIT_PATH.output,
}

export class Git {
  private readonly options: GitOptions

  constructor(options: Essentials.DeepPartial<GitOptions> = {}) {
    this.options = ObjectMerge.merge<GitOptions>(DefaultGitOptions, options)
  }

  async command(command: string): Promise<string> {
    return await this.execute(command)
  }

  async describe(): Promise<string> {
    const command = this.subcommand('describe --tags --abbrev=0')
    const response = await exec(command, { output: OutputMode.Capture })
    return response.output
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

  private subcommand(subcommand: string): string {
    return [this.options.executable, subcommand].join(' ')
  }
}
