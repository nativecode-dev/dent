import { Essentials, ObjectMerge, SemVer } from '../deps.ts'

import { DefaultGitOptions, GitExec, GitOptions } from './Helpers/GitExec.ts'

export class Git {
  private readonly options: GitOptions

  constructor(options: Essentials.DeepPartial<GitOptions> = {}) {
    this.options = ObjectMerge.merge<GitOptions>(DefaultGitOptions, options)
  }

  async branch() {
    return await this.execute('rev-parse', '--abbrev-ref HEAD')
  }

  async commits(tag: string, target: string = 'HEAD') {
    return await this.execute('log', `${tag}..${target}`, '--oneline')
  }

  async lasttag(includePrerelease: boolean): Promise<string> {
    const branch = await this.branch()
    const tags = await this.execute('tag')

    const last = tags
      .split('\n')
      .map((tag) => new SemVer(tag, { includePrerelease }))
      .reduce<string>((version, current) => (current.prerelease.length === 0 ? current.version : version), '0.0.0')

    const version = tags
      .split('\n')
      .map((version) => new SemVer(version, { includePrerelease }))
      .reduce<string>((version, current) => {
        const newer = current.compare(version) === 1
        const prerelease = includePrerelease ? current.prerelease.includes(branch) : false
        return newer && prerelease ? current.format() : version
      }, last)

    return `v${version}`
  }

  async push() {
    return await this.execute('push', 'origin', '--tags')
  }

  async tag(version: string) {
    return await this.execute('tag', version)
  }

  async taghash(tag: string) {
    return await this.execute('rev-list', '-n 1', tag)
  }

  private async execute(command: string, ...args: string[]): Promise<string> {
    const response = await GitExec(command, ...args)
    return response.output
  }
}

export const GIT = new Git(DefaultGitOptions)
