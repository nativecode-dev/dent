import { SemVer } from '../../deps.ts'

export function BranchVersion(branch: string, version: SemVer): SemVer {
  const nextver = new SemVer(version)

  if (branch === 'master') {
    return nextver
  }

  if (branch === 'develop') {
    return nextver.inc('prerelease')
  }

  return nextver.inc('pre')
}
