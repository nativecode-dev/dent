import { DentExplorer } from './DentExplorer.ts'
import { DentWatcher } from './DentWatcher.ts'

export class Dent {
  protected readonly explorer: DentExplorer = new DentExplorer()

  async exec() {
    const { config, module } = await this.explorer.explore(Deno.cwd())

    const watcher = new DentWatcher(config, module)
    await watcher.start()
  }
}
