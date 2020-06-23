import { Essentials, ObjectMerge, UrlBuilder, parse, retryAsync } from './deps.ts'

interface ProgramArgs {
  _: string[]
  retries: {
    attempts?: number
    delay?: number
  }

  host?: string
  port?: number
  protocol?: string
  type?: string
}

const DEFAULTS: Essentials.DeepPartial<ProgramArgs> = {
  _: [],
  protocol: 'http',
  retries: {
    attempts: 10,
    delay: 5000,
  },
}

const args = parse(Deno.args) as ProgramArgs
const builders = args._.map((url) => UrlBuilder.parseConnectorOptions(url))
const options = ObjectMerge.merge<ProgramArgs>(DEFAULTS, args)

await builders.reduce<Promise<boolean>>(async (_, opts) => {
  await _

  const builder = new UrlBuilder(opts)
  const url = builder.withPort().toUrl()

  try {
    return retryAsync(
      async () => {
        if (opts.endpoint.protocol === 'http:' || opts.endpoint.protocol === 'https:') {
          console.log('trying web', opts.endpoint.host, opts.endpoint.port)
          try {
            const response = await fetch(url)
            console.log('connected', url, response.status, response.statusText)
            return response.ok
          } catch (error) {
            throw error
          }
        }

        try {
          console.log('trying port', opts.endpoint.host, opts.endpoint.port)
          const options = { hostname: opts.endpoint.host, port: opts.endpoint.port! }
          const connection = await Deno.connect(options)
          console.log('connected', opts.endpoint.host, opts.endpoint.port)
          connection.close()
          return true
        } catch (error) {
          throw error
        }
      },
      { delay: options.retries.delay!, maxTry: options.retries.attempts! },
    )
  } catch {
    console.log(url, 'failed')
    return false
  }
}, Promise.resolve(false))
