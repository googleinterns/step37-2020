import { strictEqual } from 'assert';
import * as utils from '../../main/webapp/utils';
import { ProjectGraphData } from '../../main/webapp/model/project-graph-data';
import { Recommendation } from '../../main/webapp/model/recommendation';
import { RecommenderType } from '../../main/webapp/model/recommender-type';
import { Project } from '../../main/webapp/model/project';
import { ProjectMetaData } from '../../main/webapp/model/project-metadata';

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

  describe('addIamRows()', () => {
    it('Should create rows with no recommendations taken', () => {
      let dates = [new Date(2020, 6, 1), new Date(2020, 6, 2), new Date(2020, 6, 3)];
      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200
      };
      let data = new ProjectGraphData('', dateToIamBindings, {});
      let rows = [];
      utils.addIamRows(rows, data, new Project('', '', 1, undefined), 0);

      // Look through each row
      for (let i = 0; i < 3; i++) {
        let time = dates[i].getTime();
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
        [dates[0].getTime()]: new Recommendation('', rec1, RecommenderType.IAM_BINDING, dates[0].getTime())
      }
      let data = new ProjectGraphData('', dateToIamBindings, dateToRecommendations);
      let rows = [];
      utils.addIamRows(rows, data, new Project('', '', 1, undefined), 0);

      strictEqual(rows[0][2], rec1);
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
        [dates[0].getTime()]: new Recommendation('', rec1, RecommenderType.IAM_BINDING, dates[0].getTime()),
        [dates[2].getTime()]: new Recommendation('', rec2, RecommenderType.IAM_BINDING, dates[2].getTime()),
        [dates[2].getTime() + 1]: new Recommendation('', rec3, RecommenderType.IAM_BINDING, dates[2].getTime() + 1),
      }
      let data = new ProjectGraphData('', dateToIamBindings, dateToRecommendations);
      let rows = [];
      utils.addIamRows(rows, data, new Project('', '', 1, undefined), 0);

      strictEqual(rows[0][2], rec1);
      strictEqual(rows[1][2], 'IAM Bindings: 150');
      strictEqual(rows[2][2], `${rec2}\n${rec3}`);
    })
  });

  describe('addIamColumns()', () => {
    let graphData: ProjectGraphData[] = [];
    before(() => {
      let dates = [new Date(2020, 6, 1), new Date(2020, 6, 2), new Date(2020, 6, 3)];
      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200
      };
      graphData.push(new ProjectGraphData('prj-1', dateToIamBindings, {}));

      dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200
      };
      let dateToRecommendations = {
        [dates[0].getTime()]: new Recommendation('prj-1', 'rec1', RecommenderType.IAM_BINDING, dates[0].getTime()),
        [dates[2].getTime()]: new Recommendation('prj-1', 'rec2', RecommenderType.IAM_BINDING, dates[2].getTime()),
        [dates[2].getTime() + 1]: new Recommendation('prj-1', 'rec3', RecommenderType.IAM_BINDING, dates[0].getTime() + 1),
      }
      graphData.push(new ProjectGraphData('prj-2', dateToIamBindings, dateToRecommendations));
    });

    it('Should work for a single project graph', () => {
      let columns = [];
      utils.addIamColumns(columns, graphData[0]);

      strictEqual(columns.length, 3);
      strictEqual(columns[0], 'prj-1');
      strictEqual(columns[1].role, 'tooltip');
      strictEqual(columns[2].role, 'style');
    });

    it('Should work for multiple projects', () => {
      let columns = [];
      utils.addIamColumns(columns, graphData[0]);
      utils.addIamColumns(columns, graphData[1]);

      strictEqual(columns.length, 6);
      strictEqual(columns[0], 'prj-1');
      strictEqual(columns[1].role, 'tooltip');
      strictEqual(columns[2].role, 'style');

      strictEqual(columns[3], 'prj-2');
      strictEqual(columns[4].role, 'tooltip');
      strictEqual(columns[5].role, 'style');
    });
  });

  describe('addToGraph()', () => {
    let properties: { options: google.visualization.LineChartOptions, graphData: any[], columns: any[], };
    let prj1: Project, prj1Data: ProjectGraphData;
    let prj2: Project, prj2Data: ProjectGraphData;
    let dates: Date[];
    beforeEach(() => {
      dates = [new Date(2020, 6, 1), new Date(2020, 6, 2), new Date(2020, 6, 3), new Date(2020, 7, 1), new Date(2020, 7, 2), new Date(2020, 7, 3)];
      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200
      };

      properties = utils.initProperties();
      prj1 = new Project('1', '1', 1, new ProjectMetaData(100));
      prj1.color = 'white';
      prj1Data = new ProjectGraphData('1', dateToIamBindings, {});

      dateToIamBindings = {
        [dates[3].getTime()]: 70,
        [dates[4].getTime()]: 75,
        [dates[5].getTime()]: 85
      }
      prj2 = new Project('2', '2', 2, new ProjectMetaData(150));
      prj2.color = 'black';
      prj2Data = new ProjectGraphData('2', dateToIamBindings, {});
    });

    it('Should add a single graph', () => {
      utils.addToGraph(properties, prj1Data, prj1);

      strictEqual(properties.options.series[0].color, 'white');
      strictEqual(properties.columns.length, 4);
      for(let i = 0; i < 3; i++) {
        strictEqual(properties.graphData[i][0].getTime(), dates[i].getTime());
      }
    });

    it('Should add two graphs', () => {
      utils.addToGraph(properties, prj1Data, prj1);
      utils.addToGraph(properties, prj2Data, prj2);

      strictEqual(properties.options.series[0].color, 'white');
      strictEqual(properties.options.series[1].color, 'black');
      strictEqual(properties.columns.length, 7);
      for(let i = 0; i < 6; i++) {
        strictEqual(properties.graphData[i][0].getTime(), dates[i].getTime());
        // Make sure there's no overlap in values since projects are on two different time ranges
        if(i < 3) {
          strictEqual(properties.graphData[i][4], undefined);
          strictEqual(properties.graphData[i][5], undefined);
        } else {
          strictEqual(properties.graphData[i][1], undefined);
          strictEqual(properties.graphData[i][2], undefined);
        }
      }
    });
  });
});
