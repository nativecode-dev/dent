import { SemVer } from '../../deps.ts'

import { GIT } from '../Git.ts'
import { TagNext } from './TagNext.ts'
import { DentOptions } from '../DentOptions.ts'
import { GetBranchVersion } from '../Helpers/GetBranchVersion.ts'

interface TagReleaseOptions extends DentOptions {}

export async function TagRelease(args: TagReleaseOptions): Promise<string> {
  const branch = await GIT.branch()
  const nextver = new SemVer(await TagNext({ ...args, branch }))
  const tagver = new SemVer(await GIT.lasttag(branch !== 'master'))
  const version = ['v', GetBranchVersion(branch, nextver).format()].join('')

  if (tagver.compare(nextver) === 0) {
    console.log('[tag-release]', 'no version change', branch, version)
    return version
  }

  if (args['dry-run'] !== true) {
    await GIT.tag(version)
    await GIT.push()
  }

  console.log('[tag-release]', branch, version)
  return version
}
