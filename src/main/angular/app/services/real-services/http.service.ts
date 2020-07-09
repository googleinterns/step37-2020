import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectGraphData} from '../../../model/project-graph-data';
import {Project} from '../../../model/project';
import {DataService} from '../data.service';
import {ErrorMessage} from '../../../model/error-message';

@Injectable()
export class HttpService implements DataService {
  constructor(private http: HttpClient) {}

  /** Gets the graph data for the given project ID. */
  getProjectGraphData(id: string): Promise<ProjectGraphData | ErrorMessage> {
    return this.http
      .get<ProjectGraphData | ErrorMessage>(`/get-project-data?id=${id}`)
      .toPromise();
  }

  /** Gets the project information. */
  listProjects(): Promise<Project[] | ErrorMessage> {
    return this.http
      .get<Project[] | ErrorMessage>('/list-project-summaries')
      .toPromise();
  }
}
