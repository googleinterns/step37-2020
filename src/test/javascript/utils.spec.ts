import {strictEqual} from 'assert';
import {describe, it, before, beforeEach} from 'mocha';
import * as utils from '../../main/webapp/utils';
import {ProjectGraphData} from '../../main/webapp/model/project-graph-data';
import {Recommendation} from '../../main/webapp/model/recommendation';
import {RecommenderType} from '../../main/webapp/model/recommender-type';
import {Project} from '../../main/webapp/model/project';
import {ProjectMetaData} from '../../main/webapp/model/project-metadata';

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

  describe('addIamRows()', () => {
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
      const rows: any[] = [];
      utils.addIamRows(
        rows,
        data,
        new Project('', '', 1, new ProjectMetaData(1)),
        0
      );

      // Look through each row
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
      const rows: any[] = [];
      utils.addIamRows(
        rows,
        data,
        new Project('', '', 1, new ProjectMetaData(1)),
        0
      );

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
      const rows: any[] = [];
      utils.addIamRows(
        rows,
        data,
        new Project('', '', 1, new ProjectMetaData(1)),
        0
      );

      strictEqual(rows[0][2], rec1);
      strictEqual(rows[1][2], 'IAM Bindings: 150');
      strictEqual(rows[2][2], `${rec2}\n${rec3}`);
    });
  });

  describe('addIamColumns()', () => {
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
      const columns: any[] = [];
      utils.addIamColumns(columns, graphData[0]);

      strictEqual(columns.length, 3);
      strictEqual(columns[0], 'prj-1');
      strictEqual(columns[1].role, 'tooltip');
      strictEqual(columns[2].role, 'style');
    });

    it('Should work for multiple projects', () => {
      const columns: any[] = [];
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
    let properties: {
      options: google.visualization.LineChartOptions;
      graphData: any[];
      columns: any[];
    };
    let prj1: Project, prj1Data: ProjectGraphData;
    let prj2: Project, prj2Data: ProjectGraphData;
    let dates: Date[];
    beforeEach(() => {
      dates = [
        new Date(2020, 6, 1),
        new Date(2020, 6, 2),
        new Date(2020, 6, 3),
        new Date(2020, 7, 1),
        new Date(2020, 7, 2),
        new Date(2020, 7, 3),
      ];
      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200,
      };

      properties = utils.initProperties();
      prj1 = new Project('1', '1', 1, new ProjectMetaData(100));
      prj1.color = 'white';
      prj1Data = new ProjectGraphData('1', dateToIamBindings, {});

      dateToIamBindings = {
        [dates[3].getTime()]: 70,
        [dates[4].getTime()]: 75,
        [dates[5].getTime()]: 85,
      };
      prj2 = new Project('2', '2', 2, new ProjectMetaData(150));
      prj2.color = 'black';
      prj2Data = new ProjectGraphData('2', dateToIamBindings, {});
    });

    it('Should add a single graph', () => {
      utils.addToGraph(properties, prj1Data, prj1);

      if (properties.options.series) {
        strictEqual(properties.options.series[0].color, 'white');
      }
      strictEqual(properties.columns.length, 4);
      for (let i = 0; i < 3; i++) {
        strictEqual(properties.graphData[i][0].getTime(), dates[i].getTime());
      }
    });

    it('Should add two graphs', () => {
      utils.addToGraph(properties, prj1Data, prj1);
      utils.addToGraph(properties, prj2Data, prj2);

      if (properties.options.series) {
        strictEqual(properties.options.series[0].color, 'white');
        strictEqual(properties.options.series[1].color, 'black');
      }
      strictEqual(properties.columns.length, 7);
      for (let i = 0; i < 6; i++) {
        strictEqual(properties.graphData[i][0].getTime(), dates[i].getTime());
        // Make sure there's no overlap in values since projects are on two different time ranges
        if (i < 3) {
          strictEqual(properties.graphData[i][4], undefined);
          strictEqual(properties.graphData[i][5], undefined);
        } else {
          strictEqual(properties.graphData[i][1], undefined);
          strictEqual(properties.graphData[i][2], undefined);
        }
      }
    });
  });

  describe('removeFromGraph()', () => {
    let properties: {
      options: google.visualization.LineChartOptions;
      graphData: any[];
      columns: any[];
    };
    let prj1: Project, prj1Data: ProjectGraphData;
    let prj2: Project, prj2Data: ProjectGraphData;
    let dates: Date[];
    beforeEach(() => {
      dates = [
        new Date(2020, 6, 1),
        new Date(2020, 6, 2),
        new Date(2020, 6, 3),
        new Date(2020, 7, 1),
        new Date(2020, 7, 2),
        new Date(2020, 7, 3),
      ];
      let dateToIamBindings = {
        [dates[0].getTime()]: 100,
        [dates[1].getTime()]: 150,
        [dates[2].getTime()]: 200,
      };

      properties = utils.initProperties();
      prj1 = new Project('1', '1', 1, new ProjectMetaData(100));
      prj1.color = 'white';
      prj1Data = new ProjectGraphData('1', dateToIamBindings, {});

      dateToIamBindings = {
        [dates[3].getTime()]: 70,
        [dates[4].getTime()]: 75,
        [dates[5].getTime()]: 85,
      };
      prj2 = new Project('2', '2', 2, new ProjectMetaData(150));
      prj2.color = 'black';
      prj2Data = new ProjectGraphData('2', dateToIamBindings, {});

      utils.addToGraph(properties, prj1Data, prj1);
      utils.addToGraph(properties, prj2Data, prj2);
    });

    it('Should be able to remove a single project', () => {
      utils.removeFromGraph(properties, prj1);

      strictEqual(properties.columns.length, 4);
      if (properties.options.series) {
        strictEqual(properties.options.series[0].color, 'black');
      }
      // Should leave dates intact but be empty
      for (let i = 0; i < 6; i++) {
        strictEqual(properties.graphData[i][0].getTime(), dates[i].getTime());
        if (i < 3) {
          strictEqual(properties.graphData[i][1], undefined);
          strictEqual(properties.graphData[i][2], undefined);
        }
      }
    });

    it('Should remove both projects', () => {
      utils.removeFromGraph(properties, prj1);
      utils.removeFromGraph(properties, prj2);

      strictEqual(properties.columns.length, 1);
      // Should leave dates intact but be empty
      for (let i = 0; i < 6; i++) {
        strictEqual(properties.graphData[i][0].getTime(), dates[i].getTime());
      }
    });
  });
});
