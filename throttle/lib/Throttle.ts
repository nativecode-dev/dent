import { all, sync } from '../deps.ts'

export interface ThrottleTask {
  (...args: any[]): Promise<any>
}

const DECODER = new TextDecoder()
const STATE: any = {}

async function getCpuCount(): Promise<number> {
  if (STATE.cpu) {
    return STATE.cpu
  }

  const cmd = Deno.run({ cmd: ['nproc'], stderr: 'piped', stdout: 'piped' })

  try {
    const output = await cmd.output()
    return (STATE.cpu = parseInt(DECODER.decode(output), 0))
  } catch {
    return 4
  } finally {
    cmd.close()
  }
}

export class Throttle {
  static all(tasks: ThrottleTask[]): Promise<any> {
    return Throttle.async(tasks)
  }

  static async async(tasks: ThrottleTask[]): Promise<any> {
    const cpucount = await getCpuCount()
    return await all(tasks, { maxInProgress: cpucount })
  }

  static async serial(tasks: ThrottleTask[]): Promise<any> {
    return await all(tasks, { maxInProgress: 1 })
  }

  static async sync(tasks: ThrottleTask[]): Promise<any> {
    const cpucount = await getCpuCount()
    return await sync(tasks, { maxInProgress: cpucount })
  }
}
