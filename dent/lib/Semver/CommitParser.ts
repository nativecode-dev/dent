import { DentOptions } from '../DentOptions.ts'

import { Git } from '../Git.ts'

interface CommitParseOptions extends DentOptions {}

export async function CommitParser(args: CommitParseOptions): Promise<void> {
  const git = new Git()
  const tags = await git.describe()

  await Promise.all(
    tags.map(async (tag) => {
      const commits = await git.command(`log ${tag}..HEAD`)
      console.log(commits)
    }),
  )
}
