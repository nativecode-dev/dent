import { BError } from '../deps.ts'

export class HttpError extends BError {
  constructor(readonly request: RequestInit, readonly response: Response, error?: Error) {
    super(response.statusText, error)
  }
}
