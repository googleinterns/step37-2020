import {Injectable, ErrorHandler} from '@angular/core';
import {RedirectService} from './redirect.service';

/** Facilitates the transfer of an error message from one component to the error page and redirects users to the error page. */
@Injectable({providedIn: 'root'})
export class ErrorService implements ErrorHandler {
  private errors: any[];

  constructor(private redirect: RedirectService) {
    this.errors = [];
  }

  /** Add the given error and redirect the user to error page. */
  handleError(error: any): void {
    this.errors.push(error);
    this.redirect.redirect('error');
  }

  /** Returns the errors that have been logged. */
  getErrors(): any[] {
    return this.errors;
  }
}
