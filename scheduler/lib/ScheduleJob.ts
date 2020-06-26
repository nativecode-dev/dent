import { Schedule } from './Schedule.ts'
import { ScheduleJobState } from './ScheduleJobState.ts'

export interface ScheduleJob {
  id: string
  schedule: Schedule
  state: ScheduleJobState
}
