/* eslint-disable @typescript-eslint/no-explicit-any */
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectGraphData} from '../../../model/project_graph_data';
import {Project} from '../../../model/project';
import {DataService} from '../data.service';
import {ErrorMessage} from '../../../model/error_message';
import {ProjectMetaData} from '../../../model/project_metadata';

/** Service which actually retrieves data from the server. Will cache graph data. */
@Injectable()
export class DataServiceImpl implements DataService {
  /** Used for caching graph data during a page's lifecycle. Used so removing a project
   * from the graph and adding it back will not fire off an unnecessary GET request */
  private cache: {[id: string]: ProjectGraphData};

  constructor(private http: HttpClient) {
    this.cache = {};
  }

  /** Gets the graph data for the given project ID. */
  async getProjectGraphData(id: string): Promise<ProjectGraphData> {
    // Return cached data, if available
    if (this.cache[id]) {
      return new Promise(resolve => resolve(this.cache[id]));
    }

    const response: any = await this.http
      .get<any>(`/get-project-data?id=${id}`)
      .toPromise();

    // eslint-disable-next-line no-prototype-builtins
    if (response.hasOwnProperty('projectId')) {
      return new Promise(resolve => {
        const graphData = new ProjectGraphData(
          response.projectId,
          response.dateToNumberIAMBindings,
          response.dateToRecommendationTaken
        );
        this.cache[id] = graphData;
        resolve(graphData);
      });
    }

    throw new ErrorMessage(response.message, response.exception);
  }

  /** Gets the project information. */
  async listProjects(): Promise<Project[]> {
    const response: any = await this.http
      .get<any>('/list-project-summaries')
      .toPromise();

    // eslint-disable-next-line no-prototype-builtins
    if (response.hasOwnProperty('message')) {
      throw new ErrorMessage(response.message, response.exception);
    }

    // Handle response being either a Project[] or an ErrorMessage, and create it as necessary
    return new Promise(resolve => {
      // eslint-disable-next-line no-prototype-builtins
      const projects: Project[] = response.map(
        (project: any) =>
          new Project(
            project.name,
            project.projectId,
            project.projectNumber,
            new ProjectMetaData(project.metaData.averageIAMBindingsInPastYear)
          )
      );
      resolve(projects);
    });
  }
}
