import {Injectable} from '@angular/core';
import {ProjectGraphData} from '../../model/project_graph_data';
import {Row} from '../../model/types';
import {DateRange} from '../../model/date_range';

/** Contains some basic utility methods for date wrangling. */
@Injectable()
export class DateUtilitiesService {
  constructor(private dateProvider = () => new Date()) {}

  /** Checks if the two timestamps (millis since epoch) fall on the same day. Returns true if they do. */
  fallOnSameDay(time1: number, time2: number): boolean {
    const date1 = new Date(0);
    date1.setTime(time1);
    const date2 = new Date(0);
    date2.setTime(time2);

    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /** Converts the given millis since epoch to the start of the day in the local timezone. */
  startOfDay(time: number): Date {
    const date = new Date(time);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /** Extract all the unique days from the given mappings and returns them sorted. */
  uniqueDays(graphData: ProjectGraphData[]): Date[] {
    const days: Set<number> = new Set();
    graphData.forEach(data => {
      Object.keys(data.dateToNumberIAMBindings)
        .map(time => this.startOfDay(+time))
        .forEach(date => days.add(date.getTime()));
    });

    const out: Date[] = [];
    days.forEach(time => {
      out.push(new Date(time));
    });

    out.sort((a, b) => a.getTime() - b.getTime());
    return out;
  }

  /** Returns the date range present in the given rows. */
  getDateRange(rows: Row[]): DateRange {
    let earliestDate: Date | undefined;
    let lastDate: Date | undefined;

    rows.forEach(row => {
      const currentDate: Date = row[0] as Date;
      if (!earliestDate || earliestDate.getTime() > currentDate.getTime()) {
        earliestDate = currentDate;
      }
      if (!lastDate || lastDate.getTime() < currentDate.getTime()) {
        lastDate = currentDate;
      }
    });
    return new DateRange(earliestDate as Date, lastDate as Date);
  }

  /** Creates a new date using the given provider. By default, just uses the Date constructor. */
  newDate(): Date {
    return this.dateProvider();
  }

  /** Returns the time difference, in hours between the two dates. */
  getDifferenceHours(date1: Date, date2: Date): number {
    let diff = date1.getTime() - date2.getTime();
    if (diff < 0) {
      diff *= -1;
    }
    return diff / 1000 / 60 / 60;
  }
}
