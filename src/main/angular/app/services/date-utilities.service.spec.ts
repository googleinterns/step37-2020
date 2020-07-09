/* eslint-disable no-undef */
import {DateUtilitiesService} from './date-utilities.service';
import 'jasmine';

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
    it('Gets unique days from a single project', () => {});
    it('Gets unique days from multiple projects on the same timeframe', () => {});
    it('Gets unique days from multiple projects on different timeframes', () => {});
  });
});
