import { strictEqual } from 'assert';
import * as utils from '../../main/webapp/utils';
import { ProjectGraphData } from '../../main/webapp/model/project-graph-data';

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

  describe('createIamTable()', () => {
    it('Should create a table with no recommendations taken', () => {
      let dates = [new Date(100), new Date(150), new Date(200)];
      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200
      };
      let data = new ProjectGraphData('', dateToIamBindings, {});
      let rows = utils.createIamRows(data);

      // Look through each row
      for(let i = 0; i < 3; i++) {
        // Make sure dates transferred correctly
        strictEqual(rows[i][0].getTime(), dates[i].getTime());
        // Make sure values transferred correctly
        strictEqual(rows[i][1], dateToIamBindings[dates[i].getTime()]);
      }
    });
  });
});
