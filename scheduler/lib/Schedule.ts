import { ScheduleType } from './ScheduleType.ts'
import { ScheduleFunction } from './ScheduleFunction.ts'

export interface Schedule {
  command: string | ScheduleFunction
  name: string
  schedule: string
  type: ScheduleType
}
