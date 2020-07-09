/* eslint-disable no-undef */
import {GraphProcessorService} from './graph-processor.service';
import 'jasmine';
import {DateUtilitiesService} from './date-utilities.service';
import {GraphProperties} from '../model/types';
import {FakeDataService} from './fake-services/fake-data.service';
import {HttpService} from './real-services/http.service';
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
    it('Initializes empty data', () => {
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
    let changes: SimpleChanges;

    beforeAll(() => {
      fakeDataService = new FakeDataService();
      httpService = new HttpService(
        new MockHttpClient(fakeDataService),
        fakeDataService
      );
    });

    beforeEach(() => {
      properties = service.initProperties();
      changes = {};
    });

    describe('Adding projects to graph', () => {
      it('Adds a single project successfully', async () => {
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

      it('Adds multiple projects successfully', async () => {
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

    describe('Removing projects from the graph', () => {
      it('Remove a single project successfully', async () => {
        const allProjects: Project[] = fakeDataService.listProjects();
        // Add the projects
        changes.projects = new SimpleChange([], allProjects, true);
        await service.processChanges(changes, properties, httpService);

        // Remove the first project
        const projects: Project[] = allProjects
          .filter((value, index) => index !== 0)
          .map(value => value);
        const projectData: (
          | ProjectGraphData
          | undefined
        )[] = projects.map(project =>
          fakeDataService.getProjectGraphData(project.projectId)
        );
        changes.projects = new SimpleChange(allProjects, projects, false);
        await service.processChanges(changes, properties, httpService);

        const expectedColumns = 1 + projects.length * 3;
        expect(properties.columns.length).toBe(expectedColumns);
        expect(properties.columns).not.toContain(allProjects[0].projectId);
        properties.graphData.forEach(row => {
          if (row[0] instanceof Date) {
            const time = row[0].getTime();
            expect(row.length).toBe(expectedColumns);
            projectData.forEach((data, index) => {
              if (data) {
                expect(row[1 + 3 * index]).toBe(
                  data.dateToNumberIAMBindings[time]
                );
              } else {
                fail(`Project at index ${index} is empty!`);
              }
            });
          } else {
            fail(`Row ${row} doesn't have a time`);
          }
        });
      });
      it('Removes multiple projects successfully', async () => {
        const allProjects: Project[] = fakeDataService.listProjects();
        // Add the projects
        changes.projects = new SimpleChange([], allProjects, true);
        await service.processChanges(changes, properties, httpService);

        // Remove all but the first two projects
        const projects: Project[] = allProjects
          .filter((value, index) => [0, 1].includes(index))
          .map(value => value);
        const projectData: (
          | ProjectGraphData
          | undefined
        )[] = projects.map(project =>
          fakeDataService.getProjectGraphData(project.projectId)
        );
        changes.projects = new SimpleChange(allProjects, projects, false);
        await service.processChanges(changes, properties, httpService);

        const expectedColumns = 1 + projects.length * 3;
        expect(properties.columns.length).toBe(expectedColumns);
        for (let i = 2; i < allProjects.length; i++) {
          expect(properties.columns).not.toContain(allProjects[i].projectId);
        }

        properties.graphData.forEach(row => {
          if (row[0] instanceof Date) {
            const time = row[0].getTime();
            expect(row.length).toBe(expectedColumns);
            projectData.forEach((data, index) => {
              if (data) {
                expect(row[1 + 3 * index]).toBe(
                  data.dateToNumberIAMBindings[time]
                );
              } else {
                fail(`Project at index ${index} is empty!`);
              }
            });
          } else {
            fail(`Row ${row} doesn't have a time`);
          }
        });
      });
    });
    it('Re-adds projects that have been removed', async () => {
      const allProjects: Project[] = fakeDataService.listProjects();
      // Add the projects
      changes.projects = new SimpleChange([], allProjects, true);
      await service.processChanges(changes, properties, httpService);

      // Remove the first project
      const projects: Project[] = allProjects
        .filter((value, index) => index !== 0)
        .map(value => value);
      changes.projects = new SimpleChange(allProjects, projects, false);
      await service.processChanges(changes, properties, httpService);
      changes.projects = new SimpleChange(projects, allProjects, false);
      await service.processChanges(changes, properties, httpService);

      const projectData: (
        | ProjectGraphData
        | undefined
      )[] = allProjects.map(project =>
        fakeDataService.getProjectGraphData(project.projectId)
      );

      const expectedColumns = 1 + allProjects.length * 3;
      expect(properties.columns.length).toBe(expectedColumns);
      expect(properties.columns).toContain(allProjects[0].projectId);

      properties.graphData.forEach(row => {
        if (row[0] instanceof Date) {
          const time = row[0].getTime();
          expect(row.length).toBe(expectedColumns);
          expect(row).toContain(projectData[0]?.dateToNumberIAMBindings[time]);
        } else {
          fail(`Row ${row} doesn't have a time`);
        }
      });
    });
  });
});
