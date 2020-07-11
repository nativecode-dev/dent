import { SemVer } from '../../deps.ts'

import { Git } from '../Git.ts'
import { DentOptions } from '../DentOptions.ts'
import { TagCommit } from './TagCommit.ts'

interface TagReleaseOptions extends DentOptions {}

const git = new Git()

function semver(branch: string, version: SemVer): SemVer {
  const nextver = new SemVer(version)

  if (branch === 'master') {
    return nextver
  }

  if (branch === 'develop') {
    return nextver.inc('prerelease')
  }

  return nextver.inc('pre')
}

export async function TagRelease(args: TagReleaseOptions): Promise<string> {
  const branch = await git.branch()
  const nextver = new SemVer(await TagCommit(args))
  const tagver = new SemVer(await git.lasttag())
  const version = ['v', semver(branch, nextver).format()].join('')

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
