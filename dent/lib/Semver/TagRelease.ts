import { SemVer, exists } from '../../deps.ts'

import { GIT } from '../Git.ts'
import { DentOptions } from '../DentOptions.ts'
import { GetNextVersion } from '../Helpers/GetNextVersion.ts'

export interface TagReleaseOptions extends DentOptions {
  'version-file': boolean
}

export async function TagRelease(args: TagReleaseOptions): Promise<void> {
  const branch = await GIT.branch()
  const nextver = await GetNextVersion()
  const tagver = new SemVer(await GIT.lasttag(branch !== 'master'))

  if (tagver.compare(nextver) === 0) {
    console.log('[tag-release]', 'no version change, would be', nextver.version)
    return
  }

  if (args['version-file'] === true) {
    const context: any = { updated: false }

    if (await exists('VERSION')) {
      const currentver = await Deno.readTextFile('VERSION')

      if (currentver.trim() !== nextver.version) {
        await Deno.writeTextFile('VERSION', nextver.version)
        context.updated = true
      }
    } else {
      await Deno.writeTextFile('VERSION', nextver.version)
      context.updated = true
    }

    if (context.updated) {
      await GIT.add()
      await GIT.commit('[skip ci] chore(ci): update VERSION file')
    }
  }

  if (args['dry-run'] !== true) {
    await GIT.tag(nextver.version)
    await GIT.push()
  }

  console.log('[tag-release]', branch, nextver.version)
}
