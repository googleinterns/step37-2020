import {Injectable} from '@angular/core';
import {ErrorMessage} from '../../model/error_message';
import {RedirectService} from './redirect.service';

/** Facilitates the transfer of an error message from one component to the error page and redirects users to the error page. */
@Injectable()
export class ErrorService {
  constructor(private redirect: RedirectService) {
    this.errors = [];
  }

  private errors: ErrorMessage[];

  /** Sets the error and sends a redirect to the error page. */
  setErrors(errors: ErrorMessage[]) {
    this.redirect.redirect('error');
    this.errors = errors;
  }

  /** Returns the errors that have been logged. */
  getErrors(): ErrorMessage[] {
    return this.errors;
  }
}
