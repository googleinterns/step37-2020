/* eslint-disable no-undef */
import {DateUtilitiesService} from './date-utilities.service';
import 'jasmine';

describe('DateUtilitiesService', () => {
  let service: DateUtilitiesService;

  beforeEach(() => {
    service = new DateUtilitiesService();
  });

  describe('fallOnSameDay()', () => {
    it('Should work for equal times', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 6, 1);
      expect(
        service.fallOnSameDay(date1.getTime(), date2.getTime())
      ).toBeTrue();
    });

    it('Should work for different hours', () => {
      const date1 = new Date(2020, 6, 1, 7);
      const date2 = new Date(2020, 6, 1, 12);
      expect(
        service.fallOnSameDay(date1.getTime(), date2.getTime())
      ).toBeTrue();
    });

    it('Should detect exact 24 hour difference', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 1, 7);
      expect(
        service.fallOnSameDay(date1.getTime(), date2.getTime())
      ).toBeFalse();
    });
  });

  describe('startOfDay()', () => {
    it('Should work for exact start of day', () => {});
    it('Should work for times in the middle of the day', () => {});
  });

  describe('uniqueDays()', () => {
    it('Should work for a single project', () => {});
    it('Should work for multiple projects on the same timeframe', () => {});
    it('Should work for multiple projects on different timeframes', () => {});
  });
});
