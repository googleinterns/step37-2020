import {DateUtilitiesService} from './date-utilities.service';
import 'jasmine';
import {ProjectGraphData} from '../../model/project-graph-data';

describe('DateUtilitiesService', () => {
  let service: DateUtilitiesService;

  beforeEach(() => {
    service = new DateUtilitiesService();
  });

  describe('fallOnSameDay()', () => {
    it('Returns true for equal times', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 6, 1);
      expect(
        service.fallOnSameDay(date1.getTime(), date2.getTime())
      ).toBeTrue();
    });

    it('Returns true for different hours of the same day', () => {
      const date1 = new Date(2020, 6, 1, 7);
      const date2 = new Date(2020, 6, 1, 12);
      expect(
        service.fallOnSameDay(date1.getTime(), date2.getTime())
      ).toBeTrue();
    });

    it('Returns false for an exact 24 hour difference', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 1, 7);
      expect(
        service.fallOnSameDay(date1.getTime(), date2.getTime())
      ).toBeFalse();
    });
  });

  describe('startOfDay()', () => {
    it('Effects no change on an exact start of day', () => {
      const dates = [
        new Date(2020, 6, 1),
        new Date(2020, 6, 2),
        new Date(2020, 7, 8),
      ];
      dates.forEach(date => {
        expect(service.startOfDay(date.getTime())).toEqual(date);
      });
    });
    it('Gets the start of day from times throughout the day', () => {
      const expected = new Date(2020, 6, 1);
      for (let hour = 1; hour < 24; hour++) {
        const date = new Date(2020, 6, 1, hour);
        expect(service.startOfDay(date.getTime())).toEqual(expected);
      }
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

      expect(
        service.uniqueDays([new ProjectGraphData('', dateToBindings, {})])
      ).toEqual(earlyJune);
    });

    it('Gets unique days from multiple projects on the same timeframe', () => {
      earlyJune.forEach(date => (dateToBindings[date.getTime()] = 5));
      const data1 = new ProjectGraphData('', dateToBindings, {});
      const data2 = new ProjectGraphData('', dateToBindings, {});

      expect(service.uniqueDays([data1, data2])).toEqual(earlyJune);
    });

    it('Gets unique days from multiple projects on different timeframes', () => {
      earlyJune.forEach(date => (dateToBindings[date.getTime()] = 5));
      const data1 = new ProjectGraphData('', dateToBindings, {});
      dateToBindings = {};
      midJune.forEach(date => (dateToBindings[date.getTime()] = 7));
      const data2 = new ProjectGraphData('', dateToBindings, {});

      expect(service.uniqueDays([data1, data2])).toEqual(
        earlyJune.concat(midJune)
      );
    });

    it('Gets unique days from multiple projects on overlapping timeframes', () => {
      earlyJune.forEach(date => (dateToBindings[date.getTime()] = 5));
      const data1 = new ProjectGraphData('', dateToBindings, {});
      dateToBindings = {};
      midEarlyJune.forEach(date => (dateToBindings[date.getTime()] = 7));
      const data2 = new ProjectGraphData('', dateToBindings, {});

      const expected = [1, 2, 3, 4, 5, 6, 7, 8].map(i => new Date(2020, 5, i));
      expect(service.uniqueDays([data1, data2])).toEqual(expected);
    });
  });
});
