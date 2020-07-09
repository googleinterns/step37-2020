import {DateUtilitiesService} from './date_utilities.service';
import 'jasmine';
import {ProjectGraphData} from '../../model/project_graph_data';

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
});
