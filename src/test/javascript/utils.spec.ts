import { strictEqual } from 'assert';
import * as utils from '../../main/webapp/utils';

describe('Utility functions', () => {
  describe('fallOnSameDay()', () => {
    it('Should work for equal times', () => {
      let date1 = new Date(2020, 6, 1);
      let date2 = new Date(2020, 6, 1);
      strictEqual(utils.fallOnSameDay(date1.getTime(), date2.getTime()), true);
    });

    it('Should work for different hours', () => {
      let date1 = new Date(2020, 6, 1, 7);
      let date2 = new Date(2020, 6, 1, 12);
      strictEqual(utils.fallOnSameDay(date1.getTime(), date2.getTime()), true);
    });

    it('Should detect exact 24 hour difference', () => {
      let date1 = new Date(2020, 6, 1);
      let date2 = new Date(2020, 1, 7);
      strictEqual(utils.fallOnSameDay(date1.getTime(), date2.getTime()), false);
    });
  });

  describe('request()', () => {
    it('Should fake out correctly', async () => {
      let fake = { value: false, integer: 7 };
      let url = '/faked';
      utils.setResponse(url, fake);
      strictEqual(await utils.request(url, 'GET', undefined, true).then(r => r.json()), fake)
    });
  });
});
