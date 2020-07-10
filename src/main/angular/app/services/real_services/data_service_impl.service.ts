/* eslint-disable @typescript-eslint/no-explicit-any */
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectGraphData} from '../../../model/project_graph_data';
import {Project} from '../../../model/project';
import {DataService} from '../data.service';
import {ErrorMessage} from '../../../model/error_message';
import {ProjectMetaData} from '../../../model/project_metadata';

/** Service which actually retrieves data from the server */
@Injectable()
export class DataServiceImpl implements DataService {
  constructor(private http: HttpClient) {}

  /** Gets the graph data for the given project ID. */
  async getProjectGraphData(
    id: string
  ): Promise<ProjectGraphData | ErrorMessage> {
    const response: any = await this.http
      .get<any>(`/get-project-data?id=${id}`)
      .toPromise();

    // Handle response being either a ProjectGraphData or an ErrorMessage, and create it as necessary
    return new Promise(resolve => {
      // eslint-disable-next-line no-prototype-builtins
      if (response.hasOwnProperty('projectId')) {
        resolve(
          new ProjectGraphData(
            response.projectId,
            response.dateToNumberIAMBindings,
            response.dateToRecommendationTaken
          )
        );
      }
      resolve(new ErrorMessage(response.message, response.exception));
    });
  }

  /** Gets the project information. */
  async listProjects(): Promise<Project[] | ErrorMessage> {
    const response: any = await this.http
      .get<any>('/list-project-summaries')
      .toPromise();

    // Handle response being either a Project[] or an ErrorMessage, and create it as necessary
    return new Promise(resolve => {
      // eslint-disable-next-line no-prototype-builtins
      if (response.hasOwnProperty('message')) {
        resolve(new ErrorMessage(response.message, response.exception));
      } else {
        const projects: Project[] = [];
        response.forEach((project: any) => {
          projects.push(
            new Project(
              project.name,
              project.projectId,
              project.projectNumber,
              new ProjectMetaData(project.metaData.averageIAMBindingsInPastYear)
            )
          );
        });
        resolve(projects);
      }
    });
  }
}
