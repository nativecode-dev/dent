export class HttpError extends Error {
  constructor(readonly request: RequestInit, readonly response: Response) {
    super(response.statusText)
  }
}
