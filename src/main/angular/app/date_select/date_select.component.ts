import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import {DateUtilitiesService} from '../services/date_utilities.service';
import {DateRange} from '../../model/date_range';

/** Used for selecting the dates to display on the graph */
@Component({
  selector: 'app-date-select',
  templateUrl: './date_select.component.html',
  styleUrls: ['./date_select.component.css'],
})
export class DateSelectComponent implements OnInit {
  /** The possible range for the date select. */
  @Input()
  public possibleRange: DateRange;

  /** Sends the range selected by the user back out when it changes. */
  @Output()
  public selectedRange = new EventEmitter<DateRange>();

  /** The DataRange that was sent last. */
  public lastSent: DateRange;

  /** The selected date on the lower end. */
  public currentMin: Date;
  /** The selected date on the upper end. */
  public currentMax: Date;

  constructor(private dateUtilities: DateUtilitiesService) {
    this.possibleRange = new DateRange(new Date(), new Date());
    this.currentMin = new Date();
    this.currentMax = new Date();
  }

  ngOnInit(): void {}

  /** Called when an input field changes. */
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.possibleRange.isFirstChange()) {
      this.currentMin = this.possibleRange.getStart();
      // A timeout is necessary, as there is a delay before the range on the mat-date-range-input tag is updated,
      // so if the new DateRange is broader than the old one,
      // the date select will reject the change and be out-of-sync with the graph.
      setTimeout(() => {
        this.currentMax = this.possibleRange.getEnd();
        if (!this.lastSent) {
          this.lastSent = this.possibleRange;
        }
      }, 50);
    }
  }

  /** Ensures the dates are valid and sends them to output if they are. */
  private validateAndSend() {
    if (
      this.possibleRange.contains(this.currentMin) &&
      this.possibleRange.contains(this.currentMax) &&
      (this.currentMin.getTime() !== this.lastSent.getStart().getTime() ||
        this.currentMax.getTime() !== this.lastSent.getEnd().getTime())
    ) {
      this.lastSent = new DateRange(this.currentMin, this.currentMax);
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
