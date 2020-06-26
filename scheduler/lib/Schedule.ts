import { ScheduleFunction } from './ScheduleFunction.ts'

export interface Schedule {
  command: string | ScheduleFunction
  name: string
  schedule: string
  type: 'daily' | 'every' | 'hourly' | 'monthly' | 'once' | 'yearly'
}
