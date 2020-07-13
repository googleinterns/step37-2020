import {Injectable} from '@angular/core';

/** Used for sharing data between unrelated components. Just used for storing errors for now. */
@Injectable()
export class DataShareService {
  private errors: any[];

  constructor() {
    this.errors = [];
  }

  /** Returns the errors stored by this service. */
  getErrors(): any[] {
    return this.errors;
  }

  addError(error: any) {
    this.errors.push(error);
  }
}
