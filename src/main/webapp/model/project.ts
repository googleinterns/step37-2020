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
}

/** Contains comparators for sorting projects */
export class ProjectComparators {
  static getComparator(order: SortDirection, field: SortBy) {
    if (order === SortDirection.ASCENDING) {
      switch (field) {
        case SortBy.IAM_BINDINGS: return this.iamAscending;
        case SortBy.NAME: return this.nameAscending;
        case SortBy.PROJECT_ID: return this.projectIdAscending;
        case SortBy.PROJECT_NUMBER: return this.projectNumberAscending
      }
    } else {
      switch (field) {
        case SortBy.IAM_BINDINGS: return this.iamDescending;
        case SortBy.NAME: return this.nameDescending;
        case SortBy.PROJECT_ID: return this.projectIdDescending;
        case SortBy.PROJECT_NUMBER: return this.projectNumberDescending
      }
    }
  }

  /** Comparator for sorting projects in descending order by IAM Bindings */
  static iamDescending(a: Project, b: Project): number {
    return b.metaData.avgIAMBindingsInPastYear - a.metaData.avgIAMBindingsInPastYear;
  }

  /** Comparator for sorting projects in ascending order by IAM Bindings */
  static iamAscending(a: Project, b: Project): number {
    return a.metaData.avgIAMBindingsInPastYear - b.metaData.avgIAMBindingsInPastYear;
  }

  /** Comparator for sorting projects in descending order alphabetically by name */
  static nameDescending(a: Project, b: Project): number {
    return a.name.localeCompare(b.name);
  }

  /** Comparator for sorting projects in ascending order alphabetically by name */
  static nameAscending(a: Project, b: Project): number {
    return b.name.localeCompare(a.name);
  }

  /** Comparator for sorting projects in descending order alphabetically by project ID */
  static projectIdDescending(a: Project, b: Project): number {
    return a.projectId.localeCompare(b.projectId);
  }

  /** Comparator for sorting projects in ascending order alphabetically by project ID */
  static projectIdAscending(a: Project, b: Project): number {
    return b.projectId.localeCompare(a.projectId);

  }

  /** Comparator for sorting projects in descending order by project number */
  static projectNumberDescending(a: Project, b: Project): number {
    return b.projectNumber - a.projectNumber;
  }

  /** Comparator for sorting projects in ascending order by project number */
  static projectNumberAscending(a: Project, b: Project): number {
    return a.projectNumber - b.projectNumber;
  }
}

/** The order to sort projects by */
export enum SortDirection {
  ASCENDING, DESCENDING
}

/** The field to sort project by */
export enum SortBy {
  IAM_BINDINGS, NAME, PROJECT_ID, PROJECT_NUMBER
}
