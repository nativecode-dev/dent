import { GIT } from '../Git.ts'
import { DentOptions } from '../DentOptions.ts'
import { GetTagCommits } from '../Helpers/GetTagCommits.ts'
import { GetCommitVersion } from '../Helpers/GetCommitVersion.ts'
import { GetBranchVersion } from '../Helpers/GetBranchVersion.ts'

interface CommitParseOptions extends DentOptions {}

export async function TagNext(args: CommitParseOptions): Promise<string> {
  const branch = await GIT.branch()
  const version = await GIT.lasttag(branch !== 'master')
  const commits = await GetTagCommits({ tag: version })
  const branchver = GetBranchVersion({ branch, version })
  const nextver = GetCommitVersion({ commits, branch, version: branchver.version })

  if (branch === 'master') {
    nextver.prerelease = []
  }

  return `v${nextver.format()}`
}
