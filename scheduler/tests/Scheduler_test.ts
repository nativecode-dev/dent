import { Scheduler } from '../lib/Scheduler.ts'
import { ScheduleType } from '../lib/ScheduleType.ts'

Deno.test('should execute single task once', async () => {
  await new Promise((resolve) => {
    const scheduler = new Scheduler()

    scheduler.fromSchedule({
      command: () => resolve(),
      name: 'test',
      schedule: '1s',
      type: ScheduleType.once,
    })
  })
})
