import { ConnectorOptions } from '../deps.ts'

export interface StatusCheck {
  available(options: ConnectorOptions): Promise<boolean>
}
