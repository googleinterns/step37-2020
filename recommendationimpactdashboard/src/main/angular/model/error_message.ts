/** Represents an error sent by the server */
export class ErrorMessage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public message: string, public exception: any) {}
}
