import { container } from './dent/deps.ts'
import { Dent, DentOptions } from './dent/mod.ts'
import { dependencies } from './dent/lib/Dependencies.tstyringe.ts'

await dependencies<DentOptions>(container).resolve<Dent<DentOptions>>(Dent).start()
