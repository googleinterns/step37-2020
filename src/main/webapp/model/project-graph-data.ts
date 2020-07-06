// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Recommendation } from './recommendation';
import { request } from '../utils';

/** Represents the data being put on a graph for a particular project */
export class ProjectGraphData {
  projectId: string;
  dateToNumberIAMBindings: { [key: number]: number };
  dateToRecommendationTaken: { [key: number]: Recommendation };

  constructor(projectId: string, dateToNumberIAMBindings: { [key: number]: number }, dateToRecommendationTaken: { [key: number]: Recommendation }) {
    this.projectId = projectId;
    this.dateToNumberIAMBindings = dateToNumberIAMBindings;
    this.dateToRecommendationTaken = dateToRecommendationTaken;
  }

  /** Retrieves the given project graph data from the server */
  static getProject(id: string): Promise<ProjectGraphData> {
    return new Promise(resolve => request(`/get-project-data?id="${id}"`, 'GET').then(r => r.json()).then(response => {
      let project = new ProjectGraphData(response.projectId, response.dateToNumberIAMBindings, response.dateToRecommendationTaken);
      resolve(project);
    }));
  }
}
