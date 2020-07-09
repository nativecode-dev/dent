import { debounce, OutputMode, exec } from '../deps.ts'

import { DentModule, DentConfig } from '../../dent-core/mod.ts'

export class DentWatcher {
  constructor(private readonly config: DentConfig, private readonly module: DentModule) {}

  async start() {
    const watcher = Deno.watchFs(this.module.path)
    console.log('[WATCH]', this.module.path)

    for await (const event of watcher) {
      if (event.kind === 'access') {
        continue
      }

      debounce(async () => {
        const response = await exec(this.test(), { output: OutputMode.Tee })

        if (response.status.code !== 0) {
          console.error(response.output)
        } else {
          console.log(response.output)
        }
      })
    }
  }

  private test() {
    return ['deno', 'test', ...this.config.permissions.map((x) => `--${x}`)].join(' ')
  }
}
