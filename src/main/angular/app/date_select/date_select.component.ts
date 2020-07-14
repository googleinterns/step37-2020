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

  /** Sends the range selected by the user back out when it changes */
  @Output()
  public selectedRange = new EventEmitter<DateRange>();

  /** The DataRange that was sent last */
  public lastSent: DateRange;

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
    if (!this.lastSent) {
      this.lastSent = this.possibleRange;
    }
  }

  private validateAndSend() {
    if (
      this.currentMin.getTime() !== this.lastSent.start.getTime() ||
      this.currentMax.getTime() !== this.lastSent.start.getTime()
    ) {
      this.lastSent.start = this.currentMin;
      this.lastSent.end = this.currentMax;
      console.log(this.lastSent);
      this.selectedRange.emit(this.lastSent);
    }
  }

  changeStart(event) {
    const value = event.value as Date;

    if (value && value.getTime() !== this.currentMin.getTime()) {
      this.currentMin = value;
    }
    this.validateAndSend();
  }

  changeEnd(event) {
    const value = event.value as Date;

    if (value && value.getTime() !== this.currentMax.getTime()) {
      this.currentMax = value;
    }
    this.validateAndSend();
  }
}
