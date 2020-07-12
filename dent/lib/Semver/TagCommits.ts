import { GIT } from '../Git.ts'
import { GetTagCommits } from '../Helpers/GetTagCommits.ts'

export async function TagCommits(): Promise<string> {
  const branch = await GIT.branch()
  const tag = await GIT.lasttag(branch !== 'master')
  const commits = await GetTagCommits({ tag })
  return commits.map((commit) => `${commit.type} - ${commit.comment}`).join('\n')
}
