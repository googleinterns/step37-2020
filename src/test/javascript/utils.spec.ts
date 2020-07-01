import { strictEqual } from 'assert';
import * as utils from '../../main/webapp/utils';
import { ProjectGraphData } from '../../main/webapp/model/project-graph-data';
import { Recommendation } from '../../main/webapp/model/recommendation';
import { RecommenderType } from '../../main/webapp/model/recommender-type';

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

  describe('createIamRows()', () => {
    it('Should create rows with no recommendations taken', () => {
      let dates = [new Date(2020, 6, 1), new Date(2020, 6, 2), new Date(2020, 6, 3)];
      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200
      };
      let data = new ProjectGraphData('', dateToIamBindings, {});
      let rows = utils.createIamRows([data]);

      // Look through each row, ignoring the header row
      for (let i = 1; i < 4; i++) {
        let time = dates[i - 1].getTime();
        let numberBindings = dateToIamBindings[time];

        // Make sure dates transferred correctly
        strictEqual(rows[i][0].getTime(), time);
        // Make sure values transferred correctly
        strictEqual(rows[i][1], numberBindings);
        strictEqual(rows[i][2], `IAM Bindings: ${numberBindings}`);
      }
    });

    it('Should create tooltips with recommendations', () => {
      let rec1 = 'Rec-1';
      let dates = [new Date(2020, 6, 1), new Date(2020, 6, 2), new Date(2020, 6, 3)];

      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200
      };
      let dateToRecommendations = {
        [dates[0].getTime()]: new Recommendation('', rec1, RecommenderType.IAM_BINDING)
      }
      let data = new ProjectGraphData('', dateToIamBindings, dateToRecommendations);
      let rows = utils.createIamRows([data]);

      strictEqual(rows[1][2], rec1);
    });

    it('Should lump multiple recommendations together', () => {
      let rec1 = 'Rec-1';
      let rec2 = 'Rec-2';
      let rec3 = 'Rec-3';
      let dates = [new Date(2020, 6, 1), new Date(2020, 6, 2), new Date(2020, 6, 3)];

      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200
      };
      let dateToRecommendations = {
        [dates[0].getTime()]: new Recommendation('', rec1, RecommenderType.IAM_BINDING),
        [dates[2].getTime()]: new Recommendation('', rec2, RecommenderType.IAM_BINDING),
        [dates[2].getTime() + 1]: new Recommendation('', rec3, RecommenderType.IAM_BINDING),
      }
      let data = new ProjectGraphData('', dateToIamBindings, dateToRecommendations);
      let rows = utils.createIamRows([data]);

      strictEqual(rows[1][2], rec1);
      strictEqual(rows[2][2], 'IAM Bindings: 150');
      strictEqual(rows[3][2], `${rec2}\n${rec3}`);
    })
  });
});
