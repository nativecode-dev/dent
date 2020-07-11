import { SemVer } from '../../deps.ts'

import { Git } from '../Git.ts'
import { DentOptions } from '../DentOptions.ts'
import { DentConstants } from '../DentConstants.ts'

interface CommitParseOptions extends DentOptions {}

const git = new Git()

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

export async function TagCommit(args: CommitParseOptions): Promise<string> {
  const commitsSinceTag = async (tag: string) => {
    const commits = await git.command(`log ${tag}..HEAD --oneline`)

    return commits
      .split('\n')
      .map((commit) => {
        const regex = new RegExp(DentConstants.commit)
        const matches = regex.exec(commit)

        if (matches === null) {
          return 0
        }

        const type = matches[2].toLowerCase()
        return COMMIT_VALUE[type]
      })
      .reduce<number>((result, current) => (current > result ? current : result), 0)
  }

  const tag = await git.lasttag()
  const type = await commitsSinceTag(tag)
  const version = new SemVer(tag, { includePrerelease: true })

  switch (type) {
    case 3:
      version.inc('major')
      break

    case 2:
      version.inc('minor')
      break

    case 1:
      version.inc('patch')
      break

    default:
      break
  }

  return `v${version}`
}
