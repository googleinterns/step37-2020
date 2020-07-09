import {Injectable} from '@angular/core';
import {Project} from '../../model/project';
import {ProjectGraphData} from '../../model/project-graph-data';
import {ErrorMessage} from '../../model/error-message';

/** Model of a service used to get data on projects and project information */
@Injectable()
export abstract class DataService {
  /** Returns the list of projects accessible to the user */
  abstract async listProjects(): Promise<Project[] | ErrorMessage>;
  /** Returns the graph information for a particular user */
  abstract async getProjectGraphData(
    id: string
  ): Promise<ProjectGraphData | ErrorMessage>;
}
