import { ProjectFile } from './ProjectFile.ts'
import { ProjectCodeFile } from './ProjectCodeFile.ts'

export interface ProjectModule {
  code: ProjectCodeFile[]
  files: ProjectFile[]
  ignored: boolean
  location: string
  name: string
}
