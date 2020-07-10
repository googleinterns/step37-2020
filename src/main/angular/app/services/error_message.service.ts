import {Injectable} from '@angular/core';
import {ErrorMessage} from '../../model/error_message';
import {Router} from '@angular/router';
import {ERROR_PAGE_URL} from '../../constants';

/** Facilitates the transfer of an error message from one component to the error page and redirrects users to the error page */
@Injectable()
export class ErrorMessageService {
  constructor(private router: Router) {
    this.errorMessage = [];
  }

  private errorMessage: ErrorMessage[];

  addError(errors: ErrorMessage[]) {
    this.router.navigate([`/${ERROR_PAGE_URL}`]);
    this.errorMessage = errors;
  }

  getError(): ErrorMessage[] {
    return this.errorMessage;
  }
}
