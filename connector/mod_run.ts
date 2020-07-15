import { parse } from 'https://deno.land/std@0.61.0/flags/mod.ts'

interface ProgramArgs {
  _: string[]
  port: number
}

const args: ProgramArgs = parse(Deno.args) as ProgramArgs

const host = args._.reduce<string>((result, current) => {
  if (typeof current === 'string') {
    return current
  }

  return result
}, 'localhost')

async function tryConnect(hostname: string, port: number = 80) {
  try {
    await Deno.connect({ hostname, port })
    console.log(`connected to ${hostname} on ${port}`)
  } catch (error) {
    console.log(`trying ${hostname} on ${port}...`)
    setTimeout(() => tryConnect(hostname, port), 2000)
  }
}

tryConnect(host, args.port)
