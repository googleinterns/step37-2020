import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectGraphData} from '../model/project-graph-data';
import {Project} from '../model/project';
import {DEFAULT_IS_TEST} from '../utils';
import {FakeDataService} from './fake-data.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient, private fakeService: FakeDataService) {}

  /** Gets the graph data for the given project ID */
  getProjectGraphData(id: string): Promise<ProjectGraphData> {
    if (DEFAULT_IS_TEST) {
      return new Promise(resolve =>
        resolve(this.fakeService.getProjectGraphData(id))
      );
    }
    return this.http
      .get<ProjectGraphData>(`/get-project-data?id="${id}"`)
      .toPromise();
  }

  /** Gets the project information */
  listProjects(): Promise<Project[]> {
    if (DEFAULT_IS_TEST) {
      return new Promise(resolve => resolve(this.fakeService.listProjects()));
    }
    return this.http.get<Project[]>('/list-project-summaries').toPromise();
  }
}
