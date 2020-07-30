import {Component, OnInit} from '@angular/core';
import {ErrorMessage} from '../../model/error_message';
import {DataShareService} from '../services/data_share.service';
import {RedirectService} from '../services/redirect.service';

/** Main component on the error page. It displays the error messages from ErrorMessageService. */
@Component({
  selector: 'app-error-page',
  templateUrl: './error_page.component.html',
  styleUrls: ['./error_page.component.css'],
})
export class ErrorPageComponent implements OnInit {
  errors: ErrorMessage[];

  constructor(
    private dataShareService: DataShareService,
    private redirectService: RedirectService
  ) {
    this.errors = [];
  }

  ngOnInit() {
    this.errors = this.dataShareService.getErrors();

    // If there are no errors, redirect user to main page
    if (this.errors.length === 0) {
      this.redirectService.redirect('main');
    }
    console.log(this.errors);
  }
}
