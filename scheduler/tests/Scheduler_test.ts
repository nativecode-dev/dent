import { Scheduler } from '../lib/Scheduler.ts'

Deno.test('should execute single task once', async () => {
  await new Promise((resolve) => {
    const scheduler = new Scheduler()

    scheduler.fromSchedule({
      command: () => resolve(),
      name: 'test',
      schedule: '1s',
      type: 'once',
    })
  })
})
