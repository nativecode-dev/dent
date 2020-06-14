import { Application, Essentials, Router, Injectable } from '../deps.ts'

import { DentConfig } from './DentConfig.ts'
import { DentOptions } from './DentOptions.ts'

@Injectable()
export class Dent<T extends DentOptions> extends Application {
  constructor(private readonly config: DentConfig<T>, protected readonly router: Router) {
    super()
  }

  async start(): Promise<void> {
    const options = await this.config.load(Deno.cwd(), {} as Essentials.DeepPartial<T>)
    return this.listen(options.server)
  }

  stop() {
    Deno.exit()
  }
}
