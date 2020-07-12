import { GIT } from '../Git.ts'
import { DentOptions } from '../DentOptions.ts'
import { GetTagCommits } from '../Helpers/GetTagCommits.ts'
import { GetCommitVersion } from '../Helpers/GetCommitVersion.ts'

interface CommitParseOptions extends DentOptions {}

export async function TagNext(args: CommitParseOptions): Promise<string> {
  const branch = await GIT.branch()
  const tag = await GIT.lasttag(branch !== 'master')
  const commits = await GetTagCommits(tag)
  const version = GetCommitVersion(commits, branch, tag)

  if (branch === 'master') {
    version.prerelease = []
  }

  return `v${version.format()}`
}
