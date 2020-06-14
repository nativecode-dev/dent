import { DentModule } from './types/DentModule.ts'

export interface DentPlugin {
  execute(module: DentModule): Promise<void>
}
