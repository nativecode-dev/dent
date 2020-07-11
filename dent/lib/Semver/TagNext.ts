import { SemVer } from '../../deps.ts'

import { Git } from '../Git.ts'
import { DentOptions } from '../DentOptions.ts'
import { DentConstants } from '../DentConstants.ts'
import { BranchVersion } from '../Helpers/BranchVersion.ts'

interface CommitParseOptions extends DentOptions {
  branch?: string
}

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

export async function TagNext(args: CommitParseOptions): Promise<string> {
  const commits_since = async (tag: string) => {
    const commits = await git.commits(tag)

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

  const branch = await git.branch()
  const tag = await git.lasttag(branch !== 'master')
  const type = await commits_since(tag)
  const version = new SemVer(tag, { includePrerelease: branch !== 'master' })
  const final = BranchVersion(branch, version)

  return `v${final.format()}`
}
