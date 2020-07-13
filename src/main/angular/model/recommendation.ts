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

/** Represents a single accepted recommendation. */
export class Recommendation {
  projectId: string;
  description: string;
  recommender: RecommenderType;
  acceptedTimestamp: number;
  metadata: RecommenderMetadata;

  constructor(
    projectId: string,
    description: string,
    recommender: RecommenderType,
    acceptedTimestamp: number,
    metadata?: RecommenderMetadata
  ) {
    this.projectId = projectId;
    this.description = description;
    this.recommender = recommender;
    this.acceptedTimestamp = acceptedTimestamp;
    if (metadata) {
      this.metadata = metadata;
    } else {
      this.metadata = new RecommenderMetadata(50);
    }
  }
}
