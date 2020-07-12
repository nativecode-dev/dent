import { SemVer } from '../../deps.ts'

import { GIT } from '../Git.ts'
import { TagNext } from './TagNext.ts'
import { DentOptions } from '../DentOptions.ts'
import { GetBranchVersion } from '../Helpers/GetBranchVersion.ts'

interface TagReleaseOptions extends DentOptions {}

export async function TagRelease(args: TagReleaseOptions): Promise<string> {
  const branch = await GIT.branch()
  const version = await TagNext({ ...args, branch })
  const tagver = new SemVer(await GIT.lasttag(branch !== 'master'))
  const nextver = ['v', GetBranchVersion({ branch, version: tagver.version }).format()].join('')

  if (tagver.compare(version) === 0) {
    console.log('[tag-release]', 'no version change, would be', nextver)
    return nextver
  }

  if (args['dry-run'] !== true) {
    await GIT.tag(nextver)
    await GIT.push()
  }

  console.log('[tag-release]', branch, nextver)
  return nextver
}
