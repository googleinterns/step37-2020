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

import {RecommenderType} from './recommender_type';
import {RecommenderMetadata} from './recommender_metadata';
import {RecommendationAction} from './recommendation_action';

/** Represents a single accepted recommendation. */
export class Recommendation {
  constructor(
    public projectId: string,
    public organizationId: string,
    public actor: string,
    public actions: RecommendationAction[],
    public recommender: RecommenderType,
    public acceptedTimestamp: number,
    public metadata: RecommenderMetadata
  ) {}
}
