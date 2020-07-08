/* eslint-disable no-undef */
import 'jasmine';
import {HttpService} from './http.service';
import {MockHttpClient} from '../mocks/mock-http-client';
import {FakeDataService} from './fake-data.service';
import {Project} from '../model/project';
import {ProjectGraphData} from '../model/project-graph-data';

describe('HttpService', () => {
  let service: HttpService;
  let fakeDataService: FakeDataService;

  beforeAll(() => {
    fakeDataService = new FakeDataService();
  });

  beforeEach(() => {
    service = new HttpService(
      new MockHttpClient(fakeDataService),
      fakeDataService
    );
  });

  describe('listProjects()', () => {
    it('Properly lists all projects', () => {
      const projects: Project[] = fakeDataService.listProjects();
      expectAsync(service.listProjects()).toBeResolvedTo(projects);
    });
  });

  describe('getProjectGraphData()', () => {
    it('Properly retrieves project graph data', () => {
      const projects: Project[] = fakeDataService.listProjects();
      const projectData: (
        | ProjectGraphData
        | undefined
      )[] = projects.map(project =>
        fakeDataService.getProjectGraphData(project.projectId)
      );

      projectData.forEach(data => {
        if (data) {
          expectAsync(
            service.getProjectGraphData(data.projectId)
          ).toBeResolvedTo(data);
        }
      });
    });
  });
});
