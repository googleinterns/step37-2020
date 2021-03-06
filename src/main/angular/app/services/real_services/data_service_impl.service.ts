/* eslint-disable @typescript-eslint/no-explicit-any */
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectGraphData} from '../../../model/project_graph_data';
import {Project} from '../../../model/project';
import {DataService, RequestType} from '../data.service';
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
  private activeRequests: {[type in RequestType]: Set<string>};

  constructor(
    private http: HttpClient,
    private cacheService: GraphDataCacheService
  ) {
    this.activeRequests = {
      [RequestType.LIST_SUMMARIES]: new Set(),
      [RequestType.GET_PROJECT_DATA]: new Set(),
      [RequestType.GET_ORGANIZATION_DATA]: new Set(),
      [RequestType.POST_MANUAL_UPDATE]: new Set(),
    };
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
    this.activeRequests[RequestType.GET_PROJECT_DATA].add(url);
    const response: any = await this.http.get<any>(url).toPromise();

    // eslint-disable-next-line no-prototype-builtins
    if (response.hasOwnProperty('projectId')) {
      return new Promise(resolve => {
        this.activeRequests[RequestType.GET_PROJECT_DATA].delete(url);
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

  /** Gets the graph data for the given organization ID */
  async getOrganizationGraphData(id: string): Promise<OrganizationGraphData> {
    // Return cached data, if available
    if (this.cacheService.hasOrganizationEntry(id)) {
      return new Promise(resolve =>
        resolve(this.cacheService.getOrganizationEntry(id))
      );
    }

    const url = `/get-organization-data?id=${id}`;
    this.activeRequests[RequestType.GET_ORGANIZATION_DATA].add(url);
    const response: any = await this.http.get<any>(url).toPromise();

    // eslint-disable-next-line no-prototype-builtins
    if (response.hasOwnProperty('organizationId')) {
      return new Promise(resolve => {
        this.activeRequests[RequestType.GET_ORGANIZATION_DATA].delete(url);
        const graphData = new OrganizationGraphData(
          response.organizationId,
          response.datesToBindings,
          response.datesToRecommendations
        );
        this.cacheService.addOrganizationEntry(id, graphData);
        resolve(graphData);
      });
    }

    throw new ErrorMessage(response.message, response.exception);
  }

  /** Gets the project and organization information. */
  async listSummaries(): Promise<DataSummaryList> {
    const url = '/list-summaries';
    this.activeRequests[RequestType.LIST_SUMMARIES].add(url);
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
              organization.identification.id,
              organization.identification.name
            ),
            organization.averageBindings
          )
      );
      this.activeRequests[RequestType.LIST_SUMMARIES].delete(url);
      const hasAsterisk: boolean = organizations.some(organization =>
        organization.containsAsterisk()
      );
      resolve(new DataSummaryList(projects, organizations, hasAsterisk));
    });
  }

  /** Whether there is at least one pending web request. */
  hasPendingRequest(type: RequestType): boolean {
    return this.activeRequests[type].size > 0;
  }

  /** Sends a POST to /manual-update. */
  postManualUpdate(): Promise<void> {
    const url = '/manual-update';
    this.activeRequests[RequestType.POST_MANUAL_UPDATE].add(url);
    return this.http
      .post(url, {})
      .toPromise()
      .then(() => {
        this.activeRequests[RequestType.POST_MANUAL_UPDATE].delete(url);
        return undefined;
      });
  }
}
