import {GraphProcessorService} from './graph_processor.service';
import 'jasmine';
import {DateUtilitiesService} from './date_utilities.service';
import {GraphProperties} from '../../model/types';
import {FakeDataService} from './fake_services/fake_data.service';
import {SimpleChanges, SimpleChange} from '@angular/core';
import {Project} from '../../model/project';
import {ProjectGraphData} from '../../model/project_graph_data';
import {GraphDataCacheService} from './graph_data_cache.service';
import {CUMULATIVE_BINDINGS_SUFFIX} from '../../constants';
import {Recommendation} from '../../model/recommendation';

describe('GraphProcessorService', () => {
  let service: GraphProcessorService;
  const fakeDataService = new FakeDataService(
    new GraphDataCacheService(new DateUtilitiesService())
  );

  beforeAll(() => {
    service = new GraphProcessorService(
      new DateUtilitiesService(),
      fakeDataService
    );
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
    let properties: GraphProperties;
    let changes: SimpleChanges;

    describe('Adding projects to graph', () => {
      describe('Adds a single project sucessfully', () => {
        let project: Project;
        let projectData: ProjectGraphData;
        let bindingTimes: number[];

        beforeAll(async () => {
          changes = {};
          properties = service.initProperties();

          project = ((await fakeDataService.listProjects()) as Project[])[0];
          projectData = (await fakeDataService.getProjectGraphData(
            project.projectId
          )) as ProjectGraphData;
          // Going from no projects to a single one
          changes.projects = new SimpleChange([], [project], true);
          await service.processChanges(changes, properties, false);

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
          const actual: number[] = [];

          properties.graphData.forEach(row => {
            actual.push(row[1] as number);
          });
          const expected: number[] = Object.values(
            projectData.dateToNumberIAMBindings
          );

          expect(actual).toEqual(expected);
        });
      });

      describe('Adds multiple projects successfully', () => {
        let projects: Project[];
        let projectData: ProjectGraphData[];

        beforeAll(async () => {
          properties = service.initProperties();
          changes = {};

          projects = (await fakeDataService.listProjects()) as Project[];
          projectData = (await Promise.all(
            projects.map(project =>
              fakeDataService.getProjectGraphData(project.projectId)
            )
          )) as ProjectGraphData[];
          // Going from no projects to adding all of the ones above
          changes.projects = new SimpleChange([], projects, true);
          await service.processChanges(changes, properties, false);
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

      describe('Adds cumulative differences successfully', () => {
        let project: Project;
        let projectData: ProjectGraphData;
        let firstRecommendation: Recommendation;
        let dataIndex: number;

        beforeAll(async () => {
          changes = {};
          properties = service.initProperties();

          project = ((await fakeDataService.listProjects()) as Project[])[0];
          projectData = (await fakeDataService.getProjectGraphData(
            project.projectId
          )) as ProjectGraphData;

          firstRecommendation = Object.entries(
            projectData.dateToRecommendationTaken
          ).sort((a, b) => +a - +b)[0][1];

          // Going from no projects to a single one
          changes.projects = new SimpleChange([], [project], true);
          await service.processChanges(changes, properties, true);
          dataIndex = properties.columns.findIndex(
            column => column === project.projectId + CUMULATIVE_BINDINGS_SUFFIX
          );
        });

        it('Added the appropriate columns', () => {
          const expected = project.projectId + CUMULATIVE_BINDINGS_SUFFIX;
          const columns = properties.columns;

          expect(columns).toContain(expected);
        });

        it('Left data before the first recommendation be', () => {
          const expected = Object.entries(projectData.dateToNumberIAMBindings)
            .filter(entry => +entry[0] <= firstRecommendation.acceptedTimestamp)
            .map(entry => entry[1]);
          const actual = properties.graphData
            .filter(
              row =>
                row[0] instanceof Date &&
                row[0].getTime() <= firstRecommendation.acceptedTimestamp
            )
            .map(row => row[dataIndex]);

          expect(actual).toEqual(expected);
        });

        it('Modified data after the first recommendation', () => {});
      });
    });

    describe('Removing projects from the graph', () => {
      describe('Remove a single project successfully', () => {
        let allProjects: Project[];
        let projects: Project[];
        let projectData: ProjectGraphData[];

        beforeAll(async () => {
          properties = service.initProperties();
          changes = {};

          allProjects = (await fakeDataService.listProjects()) as Project[];
          // Add the projects
          changes.projects = new SimpleChange([], allProjects, true);
          await service.processChanges(changes, properties, false);

          // Remove the first project
          projects = allProjects
            .filter((value, index) => index !== 0)
            .map(value => value);
          projectData = (await Promise.all(
            projects.map(project =>
              fakeDataService.getProjectGraphData(project.projectId)
            )
          )) as ProjectGraphData[];
          changes.projects = new SimpleChange(allProjects, projects, false);
          await service.processChanges(changes, properties, false);
        });

        it('Removes columns correctly', () => {
          const expectedColumns = 1 + projects.length * 3;
          const removedId = allProjects[0].projectId;

          expect(properties.columns.length).toBe(expectedColumns);
          expect(properties.columns).not.toContain(removedId);
        });

        it('Removes data correctly', () => {
          const expected = projectData.map(data =>
            Object.values(data.dateToNumberIAMBindings)
          );
          const actual = projectData.map((data, index) =>
            properties.graphData
              .map(row => row[1 + index * 3])
              .filter(value => value !== undefined)
          );

          expect(actual).toEqual(expected);
        });
      });

      describe('Removes multiple projects successfully', () => {
        let allProjects: Project[];
        let projects: Project[];
        let projectData: ProjectGraphData[];

        beforeAll(async () => {
          properties = service.initProperties();
          changes = {};

          allProjects = (await fakeDataService.listProjects()) as Project[];

          // Add the projects
          changes.projects = new SimpleChange([], allProjects, true);
          await service.processChanges(changes, properties, false);

          // Remove all but the first two projects
          projects = allProjects
            .filter((value, index) => [0, 1].includes(index))
            .map(value => value);
          projectData = (await Promise.all(
            projects.map(project =>
              fakeDataService.getProjectGraphData(project.projectId)
            )
          )) as ProjectGraphData[];
          changes.projects = new SimpleChange(allProjects, projects, false);
          await service.processChanges(changes, properties, false);
        });

        it('Removes columns correctly', () => {
          const expectedColumns = 1 + projects.length * 3;

          expect(properties.columns.length).toBe(expectedColumns);
          for (let i = 2; i < allProjects.length; i++) {
            expect(properties.columns).not.toContain(allProjects[i].projectId);
          }
        });

        it('Removes data correctly', () => {
          const expected = projectData.map(data =>
            Object.values(data.dateToNumberIAMBindings)
          );
          const actual = projectData.map((data, index) =>
            properties.graphData
              .map(row => row[1 + index * 3])
              .filter(value => value !== undefined)
          );

          expect(actual).toEqual(expected);
        });
      });

      describe('Removes cumulative differences successfully', () => {});
    });

    describe('Re-adds projects that have been removed', () => {
      let allProjects: Project[];
      let projects: Project[];
      let projectData: ProjectGraphData[];

      beforeAll(async () => {
        properties = service.initProperties();
        changes = {};

        allProjects = (await fakeDataService.listProjects()) as Project[];
        // Add the projects
        changes.projects = new SimpleChange([], allProjects, true);
        await service.processChanges(changes, properties, false);

        // Remove the first project
        projects = allProjects
          .filter((value, index) => index !== 0)
          .map(value => value);
        changes.projects = new SimpleChange(allProjects, projects, false);
        await service.processChanges(changes, properties, false);
        changes.projects = new SimpleChange(projects, allProjects, false);
        await service.processChanges(changes, properties, false);

        projectData = (await Promise.all(
          allProjects.map(project =>
            fakeDataService.getProjectGraphData(project.projectId)
          )
        )) as ProjectGraphData[];
      });

      it('Should re-add the columns', () => {
        const expectedColumns = 1 + allProjects.length * 3;
        const addedId = allProjects[0].projectId;

        expect(properties.columns.length).toBe(expectedColumns);
        expect(properties.columns).toContain(addedId);
      });

      it('Should re-add the data', () => {
        const expected = Object.values(projectData[0].dateToNumberIAMBindings);
        const columnIndex: number = properties.columns.findIndex(
          value => value === allProjects[0].projectId
        );
        const actual = properties.graphData
          .map(row => row[columnIndex])
          .filter(value => value !== undefined);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('addCumulativeDifferences()', () => {
    describe('Adding cumulative differences for a single project', () => {});
    describe('Adding cumulative differences for multiple projects', () => {});
  });

  describe('removeCumulativeDifferences()', () => {
    describe('Removing nothing when no projects are present', () => {});
    describe('Removing differences that are continuous columns', () => {});
    describe('Removing differences that are non-continuous columns', () => {});
  });
});
