import { ObjectMerge, ReleaseType, SemVer } from '../../deps.ts'

import { Commit } from './GetTagCommits.ts'

interface Options {
  commits: Commit[]
  branch: string
  version: string
}

const MAP: any = {
  3: 'premajor',
  2: 'preminor',
  1: 'prepatch',
  master: {
    3: 'major',
    2: 'minor',
    1: 'patch',
  },
}

function getReleaseType(branch: string, value: number): ReleaseType | undefined {
  if (MAP[branch]) {
    return MAP[branch][value]
  }

  return MAP[value]
}

export function GetCommitVersion(options: Partial<Options>): SemVer {
  const context = ObjectMerge.merge<Options>({ commits: [] }, options)
  const value = context.commits.reduce<number>((result, commit) => (commit.value > result ? commit.value : result), 0)
  const nextver = new SemVer(context.version, { includePrerelease: context.branch !== 'master' })
  const type = getReleaseType(context.branch, value)

  if (options.branch !== 'master') {
    if (type) {
      nextver.inc(type, context.branch)
    } else {
      nextver.inc('pre', context.branch)
    }
  }

  return nextver
}
