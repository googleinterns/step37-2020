import {Component, OnInit, Input} from '@angular/core';
import {DateRange} from '../../model/types';

/** Used for selecting the dates to display on the graph */
@Component({
  selector: 'app-date-select',
  templateUrl: './date_select.component.html',
  styleUrls: ['./date_select.component.css'],
})
export class DateSelectComponent implements OnInit {
  /** The possible range for the date select */
  @Input()
  public possibleRange: DateRange;

  constructor() {
    this.possibleRange = {start: new Date(), end: new Date()};
  }

  ngOnInit(): void {}
}
