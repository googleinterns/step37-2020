import {Injectable, ErrorHandler} from '@angular/core';
import {RedirectService} from './redirect.service';
import {DataShareService} from './data_share.service';

/** Facilitates the transfer of an error message from one component to the error page and redirects users to the error page. */
@Injectable()
export class ErrorService implements ErrorHandler {
  constructor(
    private redirect: RedirectService,
    private dataShare: DataShareService
  ) {}

  /** Add the given error and redirect the user to error page. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(error: any): void {
    this.dataShare.addError(error);
    this.redirect.redirect('error');
  }
}
