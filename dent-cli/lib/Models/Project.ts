import { ProjectModule } from './ProjectModule.ts'

export interface Project {
  location: string
  modules: ProjectModule[]
  name: string
}
