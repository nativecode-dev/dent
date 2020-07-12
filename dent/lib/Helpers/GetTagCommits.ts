import { GIT } from '../Git.ts'
import { DentConstants } from '../DentConstants.ts'

export interface Commit {
  comment: string
  scope: string
  type: string
  value: number
}

const COMMIT_VALUE: { [key: string]: number } = {
  build: 0,
  'breaking change': 3,
  chore: 0,
  ci: 0,
  docs: 0,
  feat: 2,
  fix: 1,
  perf: 0,
  refactor: 0,
  revert: 0,
  style: 0,
  test: 0,
}

export async function GetTagCommits(tag: string): Promise<Commit[]> {
  const commits = await GIT.commits(tag)

  return commits.split('\n').map((commit) => {
    const regex = new RegExp(DentConstants.commit)
    const matches = regex.exec(commit)

    if (matches === null) {
      return { comment: '', scope: '', type: 'chore', value: 0 }
    }

    const comment = matches[4]
    const scope = matches[3]
    const type = matches[2].toLowerCase()
    const value = COMMIT_VALUE[type]
    return { comment, scope, type, value }
  })
}
