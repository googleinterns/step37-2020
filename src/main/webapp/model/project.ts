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

import { ProjectMetaData } from './project-metadata';

/** Represents relevent fields for a single project */
export class Project {
  name: string;
  projectId: string;
  projectNumber: number;
  metaData: ProjectMetaData;
  /** The color to display the given project as */
  color: string;

  constructor(name: string, projectId: string, projectNumber: number, metaData: ProjectMetaData) {
    this.name = name;
    this.projectId = projectId;
    this.projectNumber = projectNumber;
    this.metaData = metaData;
  }

  /** Comparator for sorting projects in descending order by IAM Bindings */
  static iamDescendingOrder(a: Project, b: Project): number {
    return b.metaData.avgIAMBindingsInPastYear - a.metaData.avgIAMBindingsInPastYear;
  }

  /** Comparator for sorting projects in ascending order by IAM Bindings */
  static iamAscendingOrder(a: Project, b: Project): number {
    return a.metaData.avgIAMBindingsInPastYear - b.metaData.avgIAMBindingsInPastYear;
  }

  /** Comparator for sorting projects in descending order alphabetically */
  static nameDescendingOrder(a: Project, b: Project): boolean {
    return a.name > b.name;
  }

  /** Comparator for sorting projects in ascending order alphabetically */
  static nameAscendingOrder(a: Project, b: Project): boolean {
    return a.name < b.name;
  }

}
