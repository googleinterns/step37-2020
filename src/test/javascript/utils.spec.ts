import {strictEqual} from 'assert';
import {describe, it, before} from 'mocha';
import * as utils from '../../main/webapp/utils';
import {ProjectGraphData} from '../../main/webapp/model/project-graph-data';
import {Recommendation} from '../../main/webapp/model/recommendation';
import {RecommenderType} from '../../main/webapp/model/recommender-type';

describe('Utility functions', () => {
  describe('fallOnSameDay()', () => {
    it('Should work for equal times', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 6, 1);
      strictEqual(utils.fallOnSameDay(date1.getTime(), date2.getTime()), true);
    });

    it('Should work for different hours', () => {
      const date1 = new Date(2020, 6, 1, 7);
      const date2 = new Date(2020, 6, 1, 12);
      strictEqual(utils.fallOnSameDay(date1.getTime(), date2.getTime()), true);
    });

    it('Should detect exact 24 hour difference', () => {
      const date1 = new Date(2020, 6, 1);
      const date2 = new Date(2020, 1, 7);
      strictEqual(utils.fallOnSameDay(date1.getTime(), date2.getTime()), false);
    });
  });

  describe('request()', () => {
    it('Should fake out correctly', async () => {
      const fakeData = new ProjectGraphData('1', {}, {});
      const url = '/faked';
      utils.setResponse(url, fakeData);
      strictEqual(
        await utils.request(url, 'GET', undefined, true).then(r => r.json()),
        fakeData
      );
    });
  });

  describe('createIamRows()', () => {
    it('Should create rows with no recommendations taken', () => {
      const dates = [
        new Date(2020, 6, 1),
        new Date(2020, 6, 2),
        new Date(2020, 6, 3),
      ];
      const dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200,
      };
      const data = new ProjectGraphData('', dateToIamBindings, {});
      const rows = utils.createIamRows([data]);

      // Look through each row, ignoring the header row
      for (let i = 0; i < 3; i++) {
        const time = dates[i].getTime();
        const numberBindings = dateToIamBindings[time];

        // Make sure dates transferred correctly
        strictEqual(rows[i][0].getTime(), time);
        // Make sure values transferred correctly
        strictEqual(rows[i][1], numberBindings);
        strictEqual(rows[i][2], `IAM Bindings: ${numberBindings}`);
      }
    });

    it('Should create tooltips with recommendations', () => {
      const rec1 = 'Rec-1';
      const dates = [
        new Date(2020, 6, 1),
        new Date(2020, 6, 2),
        new Date(2020, 6, 3),
      ];

      const dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200,
      };
      const dateToRecommendations = {
        [dates[0].getTime()]: new Recommendation(
          '',
          rec1,
          RecommenderType.IAM_BINDING,
          dates[0].getTime()
        ),
      };
      const data = new ProjectGraphData(
        '',
        dateToIamBindings,
        dateToRecommendations
      );
      const rows = utils.createIamRows([data]);

      strictEqual(rows[0][2], rec1);
    });

    it('Should lump multiple recommendations together', () => {
      const rec1 = 'Rec-1';
      const rec2 = 'Rec-2';
      const rec3 = 'Rec-3';
      const dates = [
        new Date(2020, 6, 1),
        new Date(2020, 6, 2),
        new Date(2020, 6, 3),
      ];

      const dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200,
      };
      const dateToRecommendations = {
        [dates[0].getTime()]: new Recommendation(
          '',
          rec1,
          RecommenderType.IAM_BINDING,
          dates[0].getTime()
        ),
        [dates[2].getTime()]: new Recommendation(
          '',
          rec2,
          RecommenderType.IAM_BINDING,
          dates[2].getTime()
        ),
        [dates[2].getTime() + 1]: new Recommendation(
          '',
          rec3,
          RecommenderType.IAM_BINDING,
          dates[2].getTime() + 1
        ),
      };
      const data = new ProjectGraphData(
        '',
        dateToIamBindings,
        dateToRecommendations
      );
      const rows = utils.createIamRows([data]);

      strictEqual(rows[0][2], rec1);
      strictEqual(rows[1][2], 'IAM Bindings: 150');
      strictEqual(rows[2][2], `${rec2}\n${rec3}`);
    });
  });

  describe('createIamColumns()', () => {
    const graphData: ProjectGraphData[] = [];
    before(() => {
      const dates = [
        new Date(2020, 6, 1),
        new Date(2020, 6, 2),
        new Date(2020, 6, 3),
      ];
      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200,
      };
      graphData.push(new ProjectGraphData('prj-1', dateToIamBindings, {}));

      dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200,
      };
      const dateToRecommendations = {
        [dates[0].getTime()]: new Recommendation(
          'prj-1',
          'rec1',
          RecommenderType.IAM_BINDING,
          dates[0].getTime()
        ),
        [dates[2].getTime()]: new Recommendation(
          'prj-1',
          'rec2',
          RecommenderType.IAM_BINDING,
          dates[2].getTime()
        ),
        [dates[2].getTime() + 1]: new Recommendation(
          'prj-1',
          'rec3',
          RecommenderType.IAM_BINDING,
          dates[0].getTime() + 1
        ),
      };
      graphData.push(
        new ProjectGraphData('prj-2', dateToIamBindings, dateToRecommendations)
      );
    });

    it('Should work for a single project graph', () => {
      const result = utils.createIamColumns([graphData[0]]);

      strictEqual(result.length, 4);
      strictEqual(result[0], 'Time');
      strictEqual(result[1], 'prj-1');
      strictEqual(result[2].role, 'tooltip');
      strictEqual(result[3].role, 'style');
    });

    it('Should work for multiple projects', () => {
      const result = utils.createIamColumns(graphData);

      strictEqual(result.length, 7);
      strictEqual(result[0], 'Time');
      strictEqual(result[1], 'prj-1');
      strictEqual(result[2].role, 'tooltip');
      strictEqual(result[3].role, 'style');

      strictEqual(result[4], 'prj-2');
      strictEqual(result[5].role, 'tooltip');
      strictEqual(result[6].role, 'style');
    });
  });
});
