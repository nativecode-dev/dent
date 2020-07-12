import { GIT } from '../Git.ts'
import { GetTagCommits } from './GetTagCommits.ts'
import { GetCommitVersion } from './GetCommitVersion.ts'

export async function GetNextVersion() {
  const branch = await GIT.branch()
  const version = await GIT.lasttag(branch !== 'master')
  const commits = await GetTagCommits({ tag: version })
  const nextver = GetCommitVersion({ commits, branch, version })

  if (branch === 'master') {
    nextver.prerelease = []
  }

  const verstr = `v${nextver.format()}`
  return verstr
}
