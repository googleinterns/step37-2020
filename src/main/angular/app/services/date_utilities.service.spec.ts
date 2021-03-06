import {DateUtilitiesService} from './date_utilities.service';
import 'jasmine';
import {ProjectGraphData} from '../../model/project_graph_data';
import {Row} from '../../model/types';
import {DateRange} from '../../model/date_range';

describe('DateUtilitiesService', () => {
  let service: DateUtilitiesService;

  beforeEach(() => {
    service = new DateUtilitiesService();
  });

  describe('fallOnSameDay()', () => {
    it('Returns true for equal times', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 6, 1);

      const result = service.fallOnSameDay(date1.getTime(), date2.getTime());

      expect(result).toBeTrue();
    });

    it('Returns true for different hours of the same day', () => {
      const date1 = new Date(2020, 6, 1, 7);
      const date2 = new Date(2020, 6, 1, 12);

      const result = service.fallOnSameDay(date1.getTime(), date2.getTime());

      expect(result).toBeTrue();
    });

    it('Returns false for an exact 24 hour difference', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 1, 7);

      const result = service.fallOnSameDay(date1.getTime(), date2.getTime());

      expect(result).toBeFalse();
    });
  });

  describe('startOfDay()', () => {
    it('Effects no change on an exact start of day', () => {
      const dates = [
        new Date(2020, 6, 1),
        new Date(2020, 6, 2),
        new Date(2020, 7, 8),
      ];

      const result = dates.map(date => service.startOfDay(date.getTime()));

      expect(result).toEqual(dates);
    });

    it('Gets the start of day from times throughout the day', () => {
      const expected = [];
      const actual = [];
      for (let hour = 1; hour < 24; hour++) {
        expected.push(new Date(2020, 6, 1));
        const date = new Date(2020, 6, 1, hour);

        actual.push(service.startOfDay(date.getTime()));
      }

      expect(actual).toEqual(expected);
    });
  });

  describe('uniqueDays()', () => {
    // June 1 - 5
    let earlyJune: Date[];
    // June 6 - 10
    let midJune: Date[];
    // June 4 - 8
    let midEarlyJune: Date[];
    let dateToBindings: {[time: number]: number};

    beforeAll(() => {
      earlyJune = [1, 2, 3, 4, 5].map(i => new Date(2020, 5, i));
      midJune = [6, 7, 8, 9, 10].map(i => new Date(2020, 5, i));
      midEarlyJune = [4, 5, 6, 7, 8].map(i => new Date(2020, 5, i));
    });

    beforeEach(() => {
      dateToBindings = {};
    });

    it('Gets unique days from a single project', () => {
      earlyJune.forEach(date => (dateToBindings[date.getTime()] = 5));

      const actual = service.uniqueDays([
        new ProjectGraphData('', dateToBindings, {}),
      ]);

      expect(actual).toEqual(earlyJune);
    });

    it('Gets unique days from multiple projects on the same timeframe', () => {
      earlyJune.forEach(date => (dateToBindings[date.getTime()] = 5));
      const data1 = new ProjectGraphData('', dateToBindings, {});
      const data2 = new ProjectGraphData('', dateToBindings, {});

      const actual = service.uniqueDays([data1, data2]);

      expect(actual).toEqual(earlyJune);
    });

    it('Gets unique days from multiple projects on different timeframes', () => {
      earlyJune.forEach(date => (dateToBindings[date.getTime()] = 5));
      const data1 = new ProjectGraphData('', dateToBindings, {});
      dateToBindings = {};
      midJune.forEach(date => (dateToBindings[date.getTime()] = 7));
      const data2 = new ProjectGraphData('', dateToBindings, {});

      const actual = service.uniqueDays([data1, data2]);
      const expected = earlyJune.concat(midJune);

      expect(actual).toEqual(expected);
    });

    it('Gets unique days from multiple projects on overlapping timeframes', () => {
      earlyJune.forEach(date => (dateToBindings[date.getTime()] = 5));
      const data1 = new ProjectGraphData('', dateToBindings, {});
      dateToBindings = {};
      midEarlyJune.forEach(date => (dateToBindings[date.getTime()] = 7));
      const data2 = new ProjectGraphData('', dateToBindings, {});

      const actual = service.uniqueDays([data1, data2]);
      const expected = [1, 2, 3, 4, 5, 6, 7, 8].map(i => new Date(2020, 5, i));

      expect(actual).toEqual(expected);
    });
  });

  describe('excludedDays()', () => {
    // June 1 - 5
    let earlyJune: Date[];
    // June 6 - 10
    let midJune: Date[];
    // June 4 - 8
    let midEarlyJune: Date[];

    beforeAll(() => {
      earlyJune = [1, 2, 3, 4, 5].map(i => new Date(2020, 5, i));
      midJune = [6, 7, 8, 9, 10].map(i => new Date(2020, 5, i));
      midEarlyJune = [4, 5, 6, 7, 8].map(i => new Date(2020, 5, i));
    });

    it('Returns empty array for complete overlap', () => {
      const actual = service.excludedDays(earlyJune, earlyJune);

      expect(actual).toEqual([]);
    });

    it('Returns the initial range when no overlap', () => {
      const actual = service.excludedDays(earlyJune, midJune);

      expect(actual).toEqual(earlyJune);
    });

    it('Returns the correct overlap', () => {
      const actual = service.excludedDays(midEarlyJune, earlyJune);
      const expected = midEarlyJune.filter((value, index) => index > 1);

      expect(actual).toEqual(expected);
    });
  });

  describe('getDateRange()', () => {
    let year: number;
    let month: number;
    let rowsEarlyJune: Row[];
    let rowsEarlyLateJune: Row[];

    beforeAll(() => {
      year = 2020;
      month = 5;
      rowsEarlyJune = [1, 2, 3, 4, 5].map(day => [new Date(year, month, day)]);
      rowsEarlyLateJune = [1, 2, 3, 4, 5, 25, 26, 27, 28, 29].map(day => [
        new Date(year, month, day),
      ]);
    });

    it('Gets the proper date range from a continous block of dates', () => {
      const expected = new DateRange(
        new Date(year, month, 1),
        new Date(year, month, 5)
      );
      const actual = service.getDateRange(rowsEarlyJune);

      expect(actual).toEqual(expected);
    });

    it('Gets the proper range for a disparate ranges', () => {
      const expected = new DateRange(
        new Date(year, month, 1),
        new Date(year, month, 29)
      );
      const actual = service.getDateRange(rowsEarlyLateJune);

      expect(actual).toEqual(expected);
    });
  });

  describe('newDate()', () => {
    it('Provides a new date based on the given provider', () => {
      const expected = new Date(2020, 6, 1);
      service.setDateProvider(() => expected);
      const actual = service.newDate();

      expect(actual).toEqual(expected);
    });
  });

  describe('getDifferenceHours()', () => {
    it('Returns 0 for identical dates', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 6, 1);
      const hours = service.getDifferenceHours(date1, date2);

      expect(hours).toEqual(0);
    });
    it('Returns the difference in hours for different dates', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 6, 2);
      const hours = service.getDifferenceHours(date1, date2);

      expect(hours).toEqual(24);
    });
  });
});
