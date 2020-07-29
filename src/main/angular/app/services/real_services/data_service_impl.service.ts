/* eslint-disable @typescript-eslint/no-explicit-any */
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectGraphData} from '../../../model/project_graph_data';
import {Project} from '../../../model/project';
import {DataService} from '../data.service';
import {ErrorMessage} from '../../../model/error_message';
import {ProjectMetaData} from '../../../model/project_metadata';
import {GraphDataCacheService} from '../graph_data_cache.service';
import {DataSummaryList} from '../../../model/data_summary_list';
import {Organization} from '../../../model/organization';
import {OrganizationIdentification} from '../../../model/organization_identification';
import {OrganizationGraphData} from '../../../model/organization_graph_data';

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
    if (this.cacheService.hasProjectEntry(id)) {
      return new Promise(resolve =>
        resolve(this.cacheService.getProjectEntry(id))
      );
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
        this.cacheService.addProjectEntry(id, graphData);
        resolve(graphData);
      });
    }

    throw new ErrorMessage(response.message, response.exception);
  }

  async getOrganizationGraphData(id: string): Promise<OrganizationGraphData> {
    return new Promise(resolve => resolve());
  }

  /** Gets the project information. */
  async listSummaries(): Promise<DataSummaryList> {
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
      const projects: Project[] = response.projects.map(
        (project: any) =>
          new Project(
            project.name,
            project.projectId,
            project.projectNumber,
            new ProjectMetaData(project.metaData.averageIAMBindingsInPastYear)
          )
      );
      const organizations: Organization[] = response.organizations.map(
        organization =>
          new Organization(
            new OrganizationIdentification(
              organization.identification.organizationId,
              organization.identification.organizationName
            ),
            organization.averageBindings
          )
      );
      this.activeRequests.delete(url);
      resolve(new DataSummaryList(projects, organizations));
    });
  }

  /** Whether there is at least one pending web request. */
  hasPendingRequest(): boolean {
    return this.activeRequests.size > 0;
  }

  /** Sends a POST to /manual-update. */
  postManualUpdate(): Promise<void> {
    const url = '/manual-update';
    this.activeRequests.add(url);
    return this.http
      .post(url, {})
      .toPromise()
      .then(() => {
        this.activeRequests.delete(url);
        return undefined;
      });
  }
}
