import { Essentials, ObjectMerge, UrlBuilder, parse, retryAsync } from './deps.ts'

interface ProgramArgs {
  _: string[]
  retries: {
    attempts?: number
    delay?: number
  }

  host?: string
  port?: number
  type?: string
}

const DEFAULTS: Essentials.DeepPartial<ProgramArgs> = {
  _: [],
  retries: {
    attempts: 10,
    delay: 2000,
  },
}

const args = parse(Deno.args) as ProgramArgs
const builders = args._.map((url) => UrlBuilder.parse(url as string))
const options = ObjectMerge.merge<ProgramArgs>(DEFAULTS, args)

await builders.reduce<Promise<boolean>>(async (_, current) => {
  await _

  const url = current.withAuthentication().withPort().toURL()

  try {
    return retryAsync(
      async () => {
        if (url.protocol === 'http' || url.protocol === 'https') {
          console.log('trying', url.toString())
          const response = await fetch(url)
          console.log(url.toString(), response.status, response.statusText)
          return response.ok
        }

        return false
      },
      { delay: options.retries.delay!, maxTry: options.retries.attempts! },
    )
  } catch {
    console.log(url.toString(), 'failed')
    return false
  }
}, Promise.resolve(false))
