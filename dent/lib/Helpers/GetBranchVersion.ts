import { SemVer } from '../../deps.ts'

export function GetBranchVersion(branch: string, version: SemVer): SemVer {
  const nextver = new SemVer(version, { includePrerelease: branch !== 'master' })

  if (branch === 'master') {
    return nextver
  }

  if (branch === 'develop') {
    return nextver.inc('prerelease')
  }

  return nextver.inc('pre')
}
