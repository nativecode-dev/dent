import { DentOptions } from '../DentOptions.ts'
import { GetNextVersion } from '../Helpers/GetNextVersion.ts'

interface CommitParseOptions extends DentOptions {}

export async function TagNext(args: CommitParseOptions): Promise<void> {
  const next = await GetNextVersion()

  if (args.silent === false) {
    console.log(['v', next.version].join(''))
  }
}
