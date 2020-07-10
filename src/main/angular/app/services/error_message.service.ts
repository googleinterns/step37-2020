import {Injectable} from '@angular/core';
import {ErrorMessage} from '../../model/error_message';
import {RedirrectService} from './redirrect.service';

/** Facilitates the transfer of an error message from one component to the error page and redirrects users to the error page. */
@Injectable()
export class ErrorMessageService {
  constructor(private redirrect: RedirrectService) {
    this.errors = [];
  }

  private errors: ErrorMessage[];

  /** Sets the error and sends a redirrect to the error page. */
  setErrors(errors: ErrorMessage[]) {
    this.redirrect.redirrect('error');
    this.errors = errors;
  }

  /** Returns the errors that have been logged. */
  getErrors(): ErrorMessage[] {
    return this.errors;
  }
}
