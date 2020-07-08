/* eslint-disable no-undef */
import {GraphProcessorService} from './graph-processor.service';
import 'jasmine';
import {DateUtilitiesService} from './date-utilities.service';
import {GraphProperties} from '../model/types';
import {FakeDataService} from './fake-data.service';
import {HttpService} from './http.service';
import {MockHttpClient} from '../mocks/mock-http-client';
import {SimpleChanges, SimpleChange} from '@angular/core';
import {Project} from '../model/project';
import {ProjectGraphData} from '../model/project-graph-data';

describe('GraphProcessorService', () => {
  let service: GraphProcessorService;

  beforeEach(() => {
    service = new GraphProcessorService(new DateUtilitiesService());
  });

  describe('initProperties()', () => {
    it('Should contain empty data', () => {
      const properties: GraphProperties = service.initProperties();

      expect(properties.columns).toEqual(['Time']);
      expect(properties.graphData).toEqual([]);
      expect(properties.type).toBe('LineChart');
      expect(properties.options.series).toBeDefined();
    });
  });

  describe('processChanges()', () => {
    let fakeDataService: FakeDataService;
    let properties: GraphProperties;
    let httpService: HttpService;

    beforeAll(() => {
      fakeDataService = new FakeDataService();
      httpService = new HttpService(
        new MockHttpClient(fakeDataService),
        fakeDataService
      );
    });

    beforeEach(() => {
      properties = service.initProperties();
    });

    describe('Adding projects to graph', () => {
      let changes: SimpleChanges;
      beforeEach(() => {
        changes = {};
      });
      it('Should add a single project', async () => {
        const project: Project = fakeDataService.listProjects()[0];
        const projectData:
          | ProjectGraphData
          | undefined = fakeDataService.getProjectGraphData(project.projectId);

        // Going from no projects to a single one
        changes.projects = new SimpleChange([], [project], true);
        await service.processChanges(changes, properties, httpService);

        expect(properties.columns.length).toBe(4);
        expect(properties.columns[1]).toBe(project.projectId);

        if (projectData) {
          const bindingTimes: number[] = Object.keys(
            projectData.dateToNumberIAMBindings
          ).map(key => +key);
          const recommendationTimes: number[] = Object.keys(
            projectData.dateToRecommendationTaken
          ).map(key => +key);
          properties.graphData.forEach((row, index) => {
            let time = -1;
            // Make sure time is correct
            if (row[0] instanceof Date) {
              time = row[0].getTime();
              expect(time).toBe(bindingTimes[index]);
            } else {
              fail('First row is not a time!');
            }

            // Make sure number bindings is correct
            expect(row[1]).toBe(projectData.dateToNumberIAMBindings[time]);
            // Make sure tooltips are correct
            if (!recommendationTimes.includes(time)) {
              expect(row[2]).toBe(
                `IAM Bindings: ${projectData.dateToNumberIAMBindings[time]}`
              );
            }
          });
        } else {
          fail('FakeDataService failed to match data to a project');
        }
      });

      it('Should add multiple projects', async () => {
        const projects = fakeDataService.listProjects();
        const projectData: (
          | ProjectGraphData
          | undefined
        )[] = projects.map(project =>
          fakeDataService.getProjectGraphData(project.projectId)
        );
        // Going from no projects to adding all of the ones above
        changes.projects = new SimpleChange([], projects, true);
        await service.processChanges(changes, properties, httpService);

        expect(properties.columns.length).toBe(1 + 3 * projects.length);
        projectData.forEach((data, projectIndex) => {
          if (data) {
            expect(properties.columns[1 + 3 * projectIndex]).toBe(
              data.projectId
            );

            // Make sure each row has the proper value
            properties.graphData.forEach((row, rowIndex) => {
              if (row[0] instanceof Date) {
                const time = row[0].getTime();
                expect(row[1 + projectIndex * 3]).toBe(
                  data.dateToNumberIAMBindings[time]
                );
              } else {
                fail(
                  `Row ${rowIndex} with alue ${row} does not have a date field`
                );
              }
            });
          } else {
            fail(`Project data ${projectIndex} does not exist`);
          }
        });
      });
    });
  });
});
