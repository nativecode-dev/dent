import { GIT } from '../Git.ts'
import { GetTagCommits } from './GetTagCommits.ts'
import { GetCommitVersion } from './GetCommitVersion.ts'

export async function GetNextVersion() {
  const branch = await GIT.branch()
  const lastver = await GIT.lasttag(branch !== 'master')
  const taghash = await GIT.taghash()
  const commits = await GetTagCommits({ tag: taghash })
  const nextver = GetCommitVersion({ commits, branch, version: lastver })

  if (branch === 'master') {
    nextver.prerelease = []
  }

  return nextver
}
