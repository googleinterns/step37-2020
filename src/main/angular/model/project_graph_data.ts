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

import {Recommendation} from './recommendation';
import {IAMResourceGraphData} from './resource_graph_data';
import {ResourceType} from './resource';
import {RecommenderType} from './recommender_type';

/** Represents the data being put on a graph for a particular project. */
export class ProjectGraphData implements IAMResourceGraphData {
  projectId: string;
  dateToNumberIAMBindings: {[key: number]: number};
  dateToRecommendationTaken: {[key: number]: Recommendation};

  constructor(
    projectId: string,
    dateToNumberIAMBindings: {[key: number]: number},
    dateToRecommendationTaken: {[key: number]: Recommendation}
  ) {
    this.projectId = projectId;
    this.dateToNumberIAMBindings = dateToNumberIAMBindings;
    this.dateToRecommendationTaken = dateToRecommendationTaken;
  }

  getDateToBindings(): {[key: number]: number} {
    return this.dateToNumberIAMBindings;
  }

  getId(): string {
    return this.projectId;
  }

  getDateToRecommendation(): {[key: number]: Recommendation} {
    return this.dateToRecommendationTaken;
  }

  getResourceType(): ResourceType {
    return ResourceType.PROJECT;
  }

  getRecommenderType(): RecommenderType {
    return RecommenderType.IAM_BINDING;
  }
}
