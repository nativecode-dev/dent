import { Essentials, ObjectMerge } from '../deps.ts'

import { DefaultGitOptions, GitExec } from './Helpers/GitExec.ts'

export interface GitOptions {
  executable: string
}

export class Git {
  private readonly options: GitOptions

  constructor(options: Essentials.DeepPartial<GitOptions> = {}) {
    this.options = ObjectMerge.merge<GitOptions>(DefaultGitOptions, options)
  }

  async branch() {
    return await this.execute('rev-parse', '--abbrev-ref HEAD')
  }

  async commits(tag: string) {
    return await this.execute('log', `${tag}..HEAD`, '--oneline')
  }

  async lasttag(): Promise<string> {
    return await this.execute('describe', '--tags', '--abbrev=0')
  }

  async push() {
    return await this.execute('push', 'origin', '--tags')
  }

  async tag(version: string) {
    return await this.execute('tag', version)
  }

  private async execute(command: string, ...args: string[]): Promise<string> {
    const response = await GitExec(command, ...args)
    return response.output
  }
}
