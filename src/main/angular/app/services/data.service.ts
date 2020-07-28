import {Injectable} from '@angular/core';
import {DataSummaryList} from '../../model/data_summary_list';
import {ProjectGraphData} from '../../model/project_graph_data';

/** Model of a service used to get data on projects and project information. */
@Injectable()
export abstract class DataService {
  /** Returns the list of projects and organizations accessible to the user. */
  abstract async listSummaries(): Promise<DataSummaryList>;
  /** Returns the graph information for a particular user. */
  abstract async getProjectGraphData(id: string): Promise<ProjectGraphData>;
  /** Returns whether there is at least one pending web request. */
  abstract hasPendingRequest(): boolean;
  /** Sends a POST to /manual-update. */
  abstract postManualUpdate(): Promise<void>;
}
