/* eslint-disable no-undef */
import 'jasmine';
import {HttpService} from './http.service';
import {MockHttpClient} from '../mocks/mock-http-client';
import {FakeDataService} from './fake-data.service';

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

  describe('getProjectGraphData()', () => {
    it('Should successfully retrieve a project', () => {});
  });

  describe('listProjects()', () => {
    it('Should list all projects', () => {});
  });
});
