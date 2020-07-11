import { SemVer } from '../../deps.ts'

import { Git } from '../Git.ts'
import { TagNext } from './TagNext.ts'
import { DentOptions } from '../DentOptions.ts'
import { BranchVersion } from '../Helpers/BranchVersion.ts'

interface TagReleaseOptions extends DentOptions {}

const git = new Git()

export async function TagRelease(args: TagReleaseOptions): Promise<string> {
  const branch = await git.branch()
  const nextver = new SemVer(await TagNext({ ...args, branch }))
  const tagver = new SemVer(await git.lasttag(branch !== 'master'))
  const version = ['v', BranchVersion(branch, nextver).format()].join('')

  if (tagver.compare(nextver) === 0) {
    console.log('[tag-release]', 'no version change', branch, version)
    return version
  }

  if (args['dry-run'] !== true) {
    await git.tag(version)
    await git.push()
  }

  console.log('[tag-release]', branch, version)
  return version
}
