/* eslint-disable no-undef */
import {GraphProcessorService} from './graph-processor.service';
import 'jasmine';
import {DateUtilitiesService} from './date-utilities.service';
import {GraphProperties} from '../model/types';
import {FakeDataService} from './fake-data.service';
import {HttpService} from './http.service';
import {HttpClient} from '@angular/common/http';
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
    let fakeData: FakeDataService;
    let properties: GraphProperties;
    let httpService: HttpService;

    beforeAll(() => {
      fakeData = new FakeDataService();
      httpService = new HttpService(new MockHttpClient(fakeData), fakeData);
    });

    beforeEach(() => {
      properties = service.initProperties();
    });

    describe('Adding projects to graph', () => {
      let changes: SimpleChanges;
      beforeEach(() => {
        changes = {};
      });
      it('Should add a single project', () => {
        const project: Project = fakeData.listProjects()[0];
        const projectData:
          | ProjectGraphData
          | undefined = fakeData.getProjectGraphData(project.projectId);

        // Going from no projects to a single one
        changes.projects = new SimpleChange([], [project], true);
        service.processChanges(changes, properties, httpService);

        expect(properties.columns.length).toBe(4);
        expect(properties.columns[1]).toBe(project.projectId);

        if (projectData) {
          const times = Object.keys(projectData.dateToNumberIAMBindings);
          properties.graphData.forEach((row, index) => {
            expect(row[0].getTime()).toBe(times[index]);
          });
        } else {
          fail('FakeDataService failed to match data to a project');
        }
      });
    });
  });
});
