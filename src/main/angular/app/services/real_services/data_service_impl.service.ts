/* eslint-disable @typescript-eslint/no-explicit-any */
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectGraphData} from '../../../model/project_graph_data';
import {Project} from '../../../model/project';
import {DataService} from '../data.service';
import {ErrorMessage} from '../../../model/error_message';
import {ProjectMetaData} from '../../../model/project_metadata';
import {GraphDataCacheService} from '../graph_data_cache.service';

/** Service which actually retrieves data from the server. Will cache graph data. */
@Injectable()
export class DataServiceImpl implements DataService {
  /** The URLs of all active requests. */
  private activeRequests: Set<string>;

  constructor(
    private http: HttpClient,
    private cacheService: GraphDataCacheService
  ) {
    this.activeRequests = new Set();
  }

  /** Gets the graph data for the given project ID. */
  async getProjectGraphData(id: string): Promise<ProjectGraphData> {
    // Return cached data, if available
    if (this.cacheService.hasEntry(id)) {
      return new Promise(resolve => resolve(this.cacheService.getEntry(id)));
    }

    const url = `/get-project-data?id=${id}`;
    this.activeRequests.add(url);
    const response: any = await this.http.get<any>(url).toPromise();

    // eslint-disable-next-line no-prototype-builtins
    if (response.hasOwnProperty('projectId')) {
      return new Promise(resolve => {
        this.activeRequests.delete(url);
        const graphData = new ProjectGraphData(
          response.projectId,
          response.dateToNumberIAMBindings,
          response.dateToRecommendationTaken
        );
        this.cacheService.addEntry(id, graphData);
        resolve(graphData);
      });
    }

    throw new ErrorMessage(response.message, response.exception);
  }

  /** Gets the project information. */
  async listProjects(): Promise<Project[]> {
    const url = '/list-project-summaries';
    this.activeRequests.add(url);
    const response: any = await this.http.get<any>(url).toPromise();

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
      this.activeRequests.delete(url);
      resolve(projects);
    });
  }

  /** Whether there is at least one pending web request. */
  hasPendingRequest(): boolean {
    return this.activeRequests.size > 0;
  }
}
