import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
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

  @Output()
  public selectedRange = new EventEmitter<DateRange>();

  public currentMin: Date;
  public currentMax: Date;

  constructor() {
    this.possibleRange = {
      start: new Date(2020, 5, 1),
      end: new Date(2020, 5, 15),
    };
  }

  ngOnInit(): void {}

  /** Called when an input field changes. */
  ngOnChanges(changes: SimpleChanges) {
    this.currentMin = this.possibleRange.start;
    this.currentMax = this.possibleRange.end;
  }

  changeInput(event) {
    console.log(event);
  }
}
