import { ObjectMerge, SemVer } from '../../deps.ts'

import { Commit } from './GetTagCommits.ts'

interface Options {
  commits: Commit[]
  branch: string
  version: string
}

export function GetCommitVersion(options: Partial<Options>): SemVer {
  const context = ObjectMerge.merge<Options>(options, { commits: [] })
  const value = context.commits.reduce((result, commit) => (commit.value > result ? commit.value : 0), 0)
  const semveropts = { includePrerelease: context.branch !== 'master' }

  switch (value) {
    case 3:
      return new SemVer(context.version, semveropts).inc('major')

    case 2:
      return new SemVer(context.version, semveropts).inc('minor')

    case 1:
      return new SemVer(context.version, semveropts).inc('patch')

    default:
      return new SemVer(context.version, semveropts)
  }
}
