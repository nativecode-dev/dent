import { Git } from '../Git.ts'
import { DentOptions } from '../DentOptions.ts'
import { CommitParser } from './CommitParser.ts'

interface TagReleaseOptions extends DentOptions {}

const git = new Git()

export async function TagRelease(args: TagReleaseOptions): Promise<undefined> {
  const nextVersion = await CommitParser(args)
  const tagged = await git.command(`tag ${nextVersion}`)
  tagged.map((tag) => console.log(tag))
  return
}
