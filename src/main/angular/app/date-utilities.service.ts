import {Injectable} from '@angular/core';
import {ProjectGraphData} from '../model/project-graph-data';

/** Contains some basic utility methods for date wrangling. */
@Injectable()
export class DateUtilitiesService {
  constructor() {}

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
}
