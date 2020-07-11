import { SemVer } from '../../deps.ts'

import { Git } from '../Git.ts'
import { DentOptions } from '../DentOptions.ts'
import { CommitParser } from './CommitParser.ts'

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

export async function TagRelease(args: TagReleaseOptions): Promise<undefined> {
  const branch = await git.command('rev-parse --abbrev-ref HEAD')
  const nextver = new SemVer(await CommitParser(args))
  const tagver = new SemVer(await git.describe())
  console.log(args, args['dry-run'])

  if (tagver.compare(nextver) === 0) {
    return
  }

  const version = semver(branch, nextver)

  if (branch === 'master') {
    await git.command(`tag ${version}`)
    console.log('[tag-release]', ['v', version.format()].join(''))
  }

  if (args['dry-run'] === false) {
    // const pushed = await git.command('git push origin --tags')
    // console.log(pushed)
  }
  return
}
