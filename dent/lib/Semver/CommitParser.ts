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

async function commitsSinceTag(tag: string) {
  const commits = await git.command(`log ${tag}..HEAD --oneline`)

  return commits
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

export async function CommitParser(args: CommitParseOptions): Promise<string> {
  const tags = await git.describe()

  const version = await tags.reduce<Promise<string | null>>(async (version, tag) => {
    const original = new SemVer(tag, { includePrerelease: true })
    const type = await commitsSinceTag(tag)
    switch (type) {
      case 3:
        original.inc('major')
        break

      case 2:
        original.inc('minor')
        break

      case 1:
        original.inc('patch')
        break

      default:
        break
    }

    return original.format()
  }, Promise.resolve(null))

  return `v${version}`
}
