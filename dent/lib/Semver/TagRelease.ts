import { SemVer } from '../../deps.ts'

import { GIT } from '../Git.ts'
import { DentOptions } from '../DentOptions.ts'
import { GetNextVersion } from '../Helpers/GetNextVersion.ts'

interface TagReleaseOptions extends DentOptions {}

export async function TagRelease(args: TagReleaseOptions): Promise<void> {
  const branch = await GIT.branch()
  const version = await GetNextVersion()
  const tagver = new SemVer(await GIT.lasttag(branch !== 'master'))
  const nextver = ['v', new SemVer(version).format()].join('')

  if (tagver.compare(version) === 0) {
    console.log('[tag-release]', 'no version change, would be', nextver)
    return
  }

  if (args['dry-run'] !== true) {
    await GIT.tag(nextver)
    await GIT.push()
  }

  console.log('[tag-release]', branch, nextver)
}
