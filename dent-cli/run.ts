import { parse } from 'https://deno.land/std@0.61.0/flags/mod.ts'

import { Lincoln, LincolnLogDebug, ObjectMerge, createLogger, createScrubTransformer } from './deps.ts'
import { Crawler } from './mod.ts'

import { Updater } from './lib/Updater.ts'

interface Command {
  (args: ProgramArgs): void | Promise<void>
}

interface ProgramArgs {
  _: string[]
  cwd: string
  debug: boolean
  log: boolean
}

const logger: Lincoln = createLogger('dent')
logger.interceptors([createScrubTransformer(['password'])])
new LincolnLogDebug(logger)

const args: ProgramArgs = ObjectMerge.merge<ProgramArgs>({ cwd: Deno.cwd() }, parse(Deno.args) as ProgramArgs)

logger.debug(args)

const COMMANDS: { [key: string]: Command } = {
  compile: async (args) => {
    logger.debug('compile')
    Deno.compile(args.cwd)
  },
  refresh: async (args) => {
    logger.debug('refresh')
    const crawler = new Crawler(logger, {})
    const project = await crawler.crawl(args.cwd)
    const updater = new Updater(logger, {})
    await updater.update(project)
  },
}

args._.map((command) => COMMANDS[command](args))

if (args._.length === 0) {
  COMMANDS['refresh'](args)
}
