import { ScheduleJobs } from './ScheduleJobs.ts'

export interface SchedulerState {
  jobs: ScheduleJobs
  started: boolean
}
