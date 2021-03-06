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

import {ProjectMetaData} from './project_metadata';
import {IAMResource, ResourceType} from './resource';

/** Represents relevent fields for a single project. */
export class Project implements IAMResource {
  name: string;
  projectId: string;
  projectNumber: number;
  metaData: ProjectMetaData;
  color: string;

  constructor(
    name: string,
    projectId: string,
    projectNumber: number,
    metaData: ProjectMetaData
  ) {
    this.name = name;
    this.projectId = projectId;
    this.projectNumber = projectNumber;
    this.metaData = metaData;
    this.color = '';
  }

  /** Whether the query string is included in the name or ID of the project */
  includes(query: string): boolean {
    return this.projectId.includes(query) || this.name.includes(query);
  }

  getAverageBindings(): number {
    return Math.round(this.metaData.getAverageIAMBindingsInPastYear());
  }

  getName(): string {
    return this.name;
  }

  getId(): string {
    return this.projectId;
  }

  getResourceType(): ResourceType {
    return ResourceType.PROJECT;
  }
}
