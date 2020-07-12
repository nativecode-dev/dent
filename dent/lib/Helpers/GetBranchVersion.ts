import { ObjectMerge, SemVer } from '../../deps.ts'

interface Options {
  branch: string
  version: string
}

export function GetBranchVersion(options: Partial<Options>): SemVer {
  const context = ObjectMerge.merge<Options>(options)
  const nextver = new SemVer(context.version, { includePrerelease: context.branch !== 'master' })

  if (context.branch === 'master') {
    return nextver
  }

  if (context.branch === 'develop') {
    return nextver.inc('pre', 'beta')
  }

  return nextver.inc('pre', context.branch)
}
