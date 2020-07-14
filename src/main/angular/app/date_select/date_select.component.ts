import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import {DateRange} from '../../model/types';
import {DateUtilitiesService} from '../services/date_utilities.service';

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

  constructor(private dateUtilities: DateUtilitiesService) {}

  ngOnInit(): void {}

  /** Called when an input field changes. */
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.possibleRange.isFirstChange()) {
      this.currentMin = this.possibleRange.start;
      this.currentMax = this.possibleRange.end;
      if (!this.lastSent) {
        this.lastSent = this.possibleRange;
      }
      this.validateAndSend();
    }
  }

  /** Ensures the dates are valid and sends them to output if they are. */
  private validateAndSend() {
    if (
      this.dateUtilities.contains(this.possibleRange, this.currentMin) &&
      this.dateUtilities.contains(this.possibleRange, this.currentMax) &&
      (this.currentMin.getTime() !== this.lastSent.start.getTime() ||
        this.currentMax.getTime() !== this.lastSent.start.getTime())
    ) {
      this.lastSent.start = this.currentMin;
      this.lastSent.end = this.currentMax;
      this.selectedRange.emit(this.lastSent);
    }
  }

  /** Called when the start value of the date select changes. */
  changeStart(event) {
    const value = event.value as Date;

    if (value && value.getTime() !== this.currentMin.getTime()) {
      this.currentMin = value;
    }
    this.validateAndSend();
  }

  /** Called when the end value of the date select changes. */
  changeEnd(event) {
    const value = event.value as Date;

    if (value && value.getTime() !== this.currentMax.getTime()) {
      this.currentMax = value;
    }
    this.validateAndSend();
  }
}
