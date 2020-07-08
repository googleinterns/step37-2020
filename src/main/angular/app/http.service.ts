import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectGraphData} from '../model/project-graph-data';
import {Project} from '../model/project';
import {FakeDataService} from './fake-data.service';
import {USE_TEST_DATA} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient, private fakeService: FakeDataService) {}

  /** Gets the graph data for the given project ID */
  getProjectGraphData(id: string): Promise<ProjectGraphData> {
    if (USE_TEST_DATA) {
      return new Promise(resolve =>
        resolve(this.fakeService.getProjectGraphData(id))
      );
    }
    return this.http
      .get<ProjectGraphData>(`/get-project-data?id=${id}`)
      .toPromise();
  }

  /** Gets the project information */
  listProjects(): Promise<Project[]> {
    if (USE_TEST_DATA) {
      return new Promise(resolve => resolve(this.fakeService.listProjects()));
    }
    return this.http.get<Project[]>('/list-project-summaries').toPromise();
  }
}
