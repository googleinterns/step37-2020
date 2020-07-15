/** Represents a range of dates. */
export class DateRange {
  constructor(private start: Date, private end: Date) {}

  /** Checks if the given date is within this date range. */
  public contains(date: Date): boolean {
    const time = date.getTime();
    if (this.start.getTime() > time || this.end.getTime() < time) {
      return false;
    }
    return true;
  }

  public getStart() {
    return this.start;
  }

  public getEnd() {
    return this.end;
  }
}
