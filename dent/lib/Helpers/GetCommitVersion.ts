import { SemVer } from '../../deps.ts'

import { Commit } from './GetTagCommits.ts'

export function GetCommitVersion(commits: Commit[], branch: string, version: string): SemVer {
  const value = commits.reduce((result, commit) => (commit.value > result ? commit.value : 0), 0)
  const options = { includePrerelease: branch !== 'master' }
  console.log(branch, version)

  switch (value) {
    case 3:
      return new SemVer(version, options).inc('major')

    case 2:
      return new SemVer(version, options).inc('minor')

    case 1:
      return new SemVer(version, options).inc('patch')

    default:
      return new SemVer(version, options)
  }
}
