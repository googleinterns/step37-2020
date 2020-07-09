/** Represents an error sent by the server */
export class ErrorMessage {
  constructor(public message: string, public exception: any) {}
}
