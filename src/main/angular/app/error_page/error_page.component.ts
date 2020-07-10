import {Component, OnInit} from '@angular/core';
import {ErrorMessageService} from '../services/error_message.service';
import {ErrorMessage} from '../../model/error_message';

@Component({
  selector: 'app-error-page',
  templateUrl: './error_page.component.html',
  styleUrls: ['./error_page.component.css'],
})
export class ErrorPageComponent implements OnInit {
  errors: ErrorMessage[];

  constructor(private errorMessageService: ErrorMessageService) {
    this.errors = [];
  }

  ngOnInit() {
    this.errors = this.errorMessageService.getErrors();
  }
}
