import { Essentials, ObjectMerge, SemVer, prerelease } from '../deps.ts'

import { DefaultGitOptions, GitExec, GitOptions } from './Helpers/GitExec.ts'

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

  async lasttag(includePreRelease: boolean): Promise<string> {
    const tags = await this.execute('tag')

    const version = tags
      .split('\n')
      .map((version) => new SemVer(version))
      .reduce<string>((version, current) => {
        if (prerelease(current) !== null && includePreRelease) {
          return current.format()
        }
        return version
      }, '0.0.0')

    return `v${version}`
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
