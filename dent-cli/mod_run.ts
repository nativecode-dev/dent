import { parse } from 'https://deno.land/std@0.58.0/flags/mod.ts'

import { ObjectMerge } from './deps.ts'

import { Crawler } from './mod.ts'
import { Updater } from './lib/Updater.ts'

interface Command {
  (args: ProgramArgs): void | Promise<void>
}

interface ProgramArgs {
  _: string[]
  cwd: string
  log: boolean
}

const args: ProgramArgs = ObjectMerge.merge<ProgramArgs>({ cwd: Deno.cwd() }, parse(Deno.args) as ProgramArgs)

const COMMANDS: { [key: string]: Command } = {
  compile: async (args) => {
    Deno.compile(args.cwd)
  },
  refresh: async (args) => {
    const crawler = new Crawler()
    const project = await crawler.crawlProject(args.cwd)
    const updater = new Updater()
    await updater.updateProject(project, args.log)
  },
}

args._.map((command) => COMMANDS[command](args))

if (args._.length === 0) {
  COMMANDS['refresh'](args)
}
