import { SemVer } from '../deps.ts'

import { Exec } from './Helpers/Exec.ts'

export class Git {
  async add() {
    return await this.execute('add', '-A', '.')
  }

  async branch() {
    return await this.execute('rev-parse', '--abbrev-ref', 'HEAD')
  }

  async commit(message: string) {
    return await this.execute('commit', '-m', message)
  }

  async commits(tag: string, target: string = 'HEAD') {
    return await this.execute('log', `${tag}..${target}`, '--oneline')
  }

  async lasttag(includePrerelease: boolean): Promise<string> {
    const branch = await this.branch()
    const tags = await this.execute('tag')

    const last = tags
      .split('\n')
      .filter((tag) => tag !== '')
      .map((tag) => {
        return new SemVer(tag, { includePrerelease })
      })
      .reduce<string>((version, current) => (current.prerelease.length === 0 ? current.version : version), '0.0.0')

    const version = tags
      .split('\n')
      .filter((tag) => tag !== '')
      .map((version) => new SemVer(version, { includePrerelease }))
      .reduce<string>((version, current) => {
        const newer = current.compare(version) === 1
        const prerelease = includePrerelease ? current.prerelease.includes(branch) : false
        return newer && prerelease ? current.format() : version
      }, last)

    return `v${version}`
  }

  async tag(version: string) {
    return await this.execute('tag', version)
  }

  async tagpush() {
    return await this.execute('push', 'origin', '--tags')
  }

  async taghash(tag: string) {
    return await this.execute('rev-list', '-n', '1', tag)
  }

  private async execute(...args: string[]): Promise<string> {
    return await Exec('git', ...args)
  }
}

export const GIT = new Git()
