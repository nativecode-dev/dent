import { DentModuleFile } from './DentModuleFile.ts'

export interface DentModule {
  files: DentModuleFile[]
  modules: DentModule[]
  name: string
  path: string
}

export function moduleEntryPoint(module: DentModule): string {
  return module.files.reduce<string>((result, current) => (current.name === 'mod.ts' ? current.name : result), 'mod.ts')
}
