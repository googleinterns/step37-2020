import {GraphProcessorService} from './graph_processor.service';
import 'jasmine';
import {DateUtilitiesService} from './date_utilities.service';
import {GraphProperties} from '../../model/types';
import {FakeDataService} from './fake_services/fake_data.service';
import {SimpleChanges, SimpleChange} from '@angular/core';
import {Project} from '../../model/project';
import {ProjectGraphData} from '../../model/project_graph_data';

describe('GraphProcessorService', () => {
  let service: GraphProcessorService;

  beforeAll(() => {
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
    let changes: SimpleChanges;

    beforeAll(() => {
      fakeDataService = new FakeDataService();
    });

    describe('Adding projects to graph', () => {
      describe('Adds a single project sucessfully', () => {
        let project: Project;
        let projectData: ProjectGraphData;
        let bindingTimes: number[];

        beforeAll(async () => {
          changes = {};
          properties = service.initProperties();

          project = (await fakeDataService.listProjects())[0];
          projectData = await fakeDataService.getProjectGraphData(
            project.projectId
          );
          // Going from no projects to a single one
          changes.projects = new SimpleChange([], [project], true);
          await service.processChanges(changes, properties, fakeDataService);

          bindingTimes = Object.keys(projectData.dateToNumberIAMBindings).map(
            key => +key
          );
        });

        it('Sets up columns properly', () => {
          expect(properties.columns.length).toBe(4);
          expect(properties.columns[1]).toBe(project.projectId);
        });

        it('Adds the correct times', () => {
          const actual: number[] = [];
          properties.graphData.forEach(row => {
            if (row[0] instanceof Date) {
              actual.push(row[0].getTime());
            } else {
              fail('First row is not a Date!');
            }
          });
          expect(actual).toEqual(bindingTimes);
        });

        it('Adds the correct number of bindings', () => {
          const expected: number[] = Object.values(
            projectData.dateToNumberIAMBindings
          );
          const actual: number[] = [];

          properties.graphData.forEach(row => {
            actual.push(row[1] as number);
          });

          expect(actual).toEqual(expected);
        });
      });

      describe('Adds multiple projects successfully', () => {
        let projects: Project[];
        let projectData: ProjectGraphData[];

        beforeAll(async () => {
          properties = service.initProperties();
          changes = {};

          projects = await fakeDataService.listProjects();
          projectData = await Promise.all(
            projects.map(project =>
              fakeDataService.getProjectGraphData(project.projectId)
            )
          );
          // Going from no projects to adding all of the ones above
          changes.projects = new SimpleChange([], projects, true);
          await service.processChanges(changes, properties, fakeDataService);
        });

        it('Sets up columns properly', () => {
          const expectedIds = projects.map(project => project.projectId);
          const actualIds = properties.columns.filter(
            (value, index) => index % 3 === 1
          );

          expect(properties.columns.length).toBe(1 + 3 * projects.length);
          expect(actualIds).toEqual(expectedIds);
        });

        it('Adds the correct number of bindings', () => {
          const expected = projectData.map(data =>
            Object.values(data.dateToNumberIAMBindings)
          );
          const actual = projectData.map((data, index) =>
            properties.graphData
              .map(row => row[1 + 3 * index])
              .filter(position => position !== undefined)
          );

          expect(actual).toEqual(expected);
        });
      });
    });

    describe('Removing projects from the graph', () => {
      beforeEach(() => {
        properties = service.initProperties();
        changes = {};
      });

      it('Remove a single project successfully', async () => {
        const allProjects: Project[] = await fakeDataService.listProjects();
        // Add the projects
        changes.projects = new SimpleChange([], allProjects, true);
        await service.processChanges(changes, properties, fakeDataService);

        // Remove the first project
        const projects: Project[] = allProjects
          .filter((value, index) => index !== 0)
          .map(value => value);
        const projectData: ProjectGraphData[] = await Promise.all(
          projects.map(project =>
            fakeDataService.getProjectGraphData(project.projectId)
          )
        );
        changes.projects = new SimpleChange(allProjects, projects, false);
        await service.processChanges(changes, properties, fakeDataService);

        const expectedColumns = 1 + projects.length * 3;
        expect(properties.columns.length).toBe(expectedColumns);
        expect(properties.columns).not.toContain(allProjects[0].projectId);
        properties.graphData.forEach(row => {
          if (row[0] instanceof Date) {
            const time = row[0].getTime();
            expect(row.length).toBe(expectedColumns);
            projectData.forEach((data, index) => {
              expect(row[1 + 3 * index]).toBe(
                data.dateToNumberIAMBindings[time]
              );
            });
          } else {
            fail(`Row ${row} doesn't have a time`);
          }
        });
      });
      it('Removes multiple projects successfully', async () => {
        const allProjects: Project[] = await fakeDataService.listProjects();
        // Add the projects
        changes.projects = new SimpleChange([], allProjects, true);
        await service.processChanges(changes, properties, fakeDataService);

        // Remove all but the first two projects
        const projects: Project[] = allProjects
          .filter((value, index) => [0, 1].includes(index))
          .map(value => value);
        const projectData: ProjectGraphData[] = await Promise.all(
          projects.map(project =>
            fakeDataService.getProjectGraphData(project.projectId)
          )
        );
        changes.projects = new SimpleChange(allProjects, projects, false);
        await service.processChanges(changes, properties, fakeDataService);

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
              expect(row[1 + 3 * index]).toBe(
                data.dateToNumberIAMBindings[time]
              );
            });
          } else {
            fail(`Row ${row} doesn't have a time`);
          }
        });
      });
    });
    it('Re-adds projects that have been removed', async () => {
      properties = service.initProperties();
      changes = {};

      const allProjects: Project[] = await fakeDataService.listProjects();
      // Add the projects
      changes.projects = new SimpleChange([], allProjects, true);
      await service.processChanges(changes, properties, fakeDataService);

      // Remove the first project
      const projects: Project[] = allProjects
        .filter((value, index) => index !== 0)
        .map(value => value);
      changes.projects = new SimpleChange(allProjects, projects, false);
      await service.processChanges(changes, properties, fakeDataService);
      changes.projects = new SimpleChange(projects, allProjects, false);
      await service.processChanges(changes, properties, fakeDataService);

      const projectData: ProjectGraphData[] = await Promise.all(
        allProjects.map(project =>
          fakeDataService.getProjectGraphData(project.projectId)
        )
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
