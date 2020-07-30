import 'jasmine';
import {DateRange} from './date_range';

describe('DateRange', () => {
  describe('contains()', () => {
    let range: DateRange;

    beforeAll(() => {
      range = new DateRange(new Date(2020, 5, 1), new Date(2020, 5, 25));
    });

    it('Includes dates in the middle of the date range', () => {
      const date = new Date(2020, 5, 5);
      const included = range.contains(date);

      expect(included).toBeTrue();
    });

    describe('Includes dates at the extreminites of date range', () => {
      it('Includes dates at the beginning', () => {
        const date = new Date(2020, 5, 1);
        const included = range.contains(date);

        expect(included).toBeTrue();
      });

      it('Includes dates at the end', () => {
        const date = new Date(2020, 5, 25);
        const included = range.contains(date);

        expect(included).toBeTrue();
      });
    });

    describe('Excludes dates outside of the date range', () => {
      it('Excludes dates before', () => {
        const date = new Date(2020, 4, 25);
        const included = range.contains(date);

        expect(included).toBeFalse();
      });
      it('Excludes dates after', () => {
        const date = new Date(2020, 5, 26);
        const included = range.contains(date);

        expect(included).toBeFalse();
      });
    });
  });
});
