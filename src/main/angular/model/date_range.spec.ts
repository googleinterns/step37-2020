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
    it('Includes dates at the beginning/end of date range', () => {});
    describe('Excludes dates outside of the date range', () => {
      it('Excludes dates before', () => {});
      it('Excludes dates after', () => {});
    });
  });
});
