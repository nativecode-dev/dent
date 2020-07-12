import { GIT } from '../Git.ts'
import { GetTagCommits } from '../Helpers/GetTagCommits.ts'

export async function TagCommits(): Promise<void> {
  const branch = await GIT.branch()
  const tag = await GIT.lasttag(branch !== 'master')
  const commits = await GetTagCommits({ tag })
  const lines = commits.map((commit) => [commit.type, commit.scope ? `(${commit.scope})` : '', ': ', commit.comment].join(''))
  lines.forEach(line => console.log(line))
}
