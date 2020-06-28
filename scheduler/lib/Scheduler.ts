import { daily, every, hourly, monthly, once, unregister, yearly } from '../deps.ts'

import { Schedule } from './Schedule.ts'
import { SchedulerState } from './SchedulerState.ts'
import { ScheduleJobState } from './ScheduleJobState.ts'

const FUNCTIONS: { [key: string]: (t: any, fn: any) => string } = { daily, every, hourly, monthly, once, yearly }

export class Scheduler {
  private readonly decoder = new TextDecoder()
  private readonly state: SchedulerState = { jobs: {} }

  get jobs(): string[] {
    return Object.keys(this.state.jobs)
  }

  cancel(name: string): void {
    unregister(this.state.jobs[name].id)
  }

  fromSchedule(schedule: Schedule): string {
    const scheduler = FUNCTIONS[schedule.type]

    const job = (this.state.jobs[schedule.name] = {
      id: scheduler(schedule.schedule, async () => {
        const job = this.state.jobs[schedule.name]

        if (job.state === ScheduleJobState.running) {
          return
        }

        try {
          job.state = ScheduleJobState.running

          if (typeof job.schedule.command === 'string') {
            await this.exec(job.schedule.schedule)
          }

          if (typeof job.schedule.command === 'function') {
            await job.schedule.command()
          }
        } finally {
          job.state = ScheduleJobState.stopped
        }
      }),
      schedule,
      state: ScheduleJobState.pending,
    })

    return job.id
  }

  async fromScheduleFile(filename: string): Promise<string> {
    const contents = await Deno.readTextFile(filename)
    const schedule: Schedule = JSON.parse(contents)
    return this.fromSchedule(schedule)
  }

  protected async exec(command: string): Promise<string> {
    const process = Deno.run({ cmd: [command], stdout: 'piped' })
    const output = await process.output()
    return this.decoder.decode(output)
  }
}
