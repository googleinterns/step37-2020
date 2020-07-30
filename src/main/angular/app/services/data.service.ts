import {Injectable} from '@angular/core';
import {DataSummaryList} from '../../model/data_summary_list';
import {ProjectGraphData} from '../../model/project_graph_data';
import {OrganizationGraphData} from '../../model/organization_graph_data';

/** Model of a service used to get data on projects and project information. */
@Injectable()
export abstract class DataService {
  /** Returns the list of projects and organizations accessible to the user. */
  abstract async listSummaries(): Promise<DataSummaryList>;
  /** Returns the project graph information for a particular user. */
  abstract async getProjectGraphData(id: string): Promise<ProjectGraphData>;
  /** Returns the organization graph information for the given organization.  */
  abstract async getOrganizationGraphData(
    id: string
  ): Promise<OrganizationGraphData>;
  /** Returns whether there is at least one pending web request. */
  abstract hasPendingRequest(): boolean;
  /** Sends a POST to /manual-update. */
  abstract postManualUpdate(): Promise<void>;
}
