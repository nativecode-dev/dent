export interface ScheduleFunction {
  (): Promise<void> | void
}
