import {Project} from './project';

/** Contains comparators for sorting projects. */
export class ProjectComparators {
  static getComparator(order: SortDirection, field: SortBy) {
    if (order === SortDirection.ASCENDING) {
      switch (field) {
        case SortBy.IAM_BINDINGS:
          return this.iamAscending;
        case SortBy.NAME:
          return this.nameAscending;
        case SortBy.PROJECT_ID:
          return this.projectIdAscending;
        case SortBy.PROJECT_NUMBER:
          return this.projectNumberAscending;
      }
    } else {
      switch (field) {
        case SortBy.IAM_BINDINGS:
          return this.iamDescending;
        case SortBy.NAME:
          return this.nameDescending;
        case SortBy.PROJECT_ID:
          return this.projectIdDescending;
        case SortBy.PROJECT_NUMBER:
          return this.projectNumberDescending;
      }
    }
  }

  /** Comparator for sorting projects in descending order by IAM Bindings. */
  private static iamDescending(a: Project, b: Project): number {
    return (
      b.metaData.getAverageIAMBindingsInPastYear() -
      a.metaData.getAverageIAMBindingsInPastYear()
    );
  }

  /** Comparator for sorting projects in ascending order by IAM Bindings. */
  private static iamAscending(a: Project, b: Project): number {
    return (
      a.metaData.getAverageIAMBindingsInPastYear() -
      b.metaData.getAverageIAMBindingsInPastYear()
    );
  }

  /** Comparator for sorting projects in descending order alphabetically by name. */
  private static nameDescending(a: Project, b: Project): number {
    return a.name.localeCompare(b.name);
  }

  /** Comparator for sorting projects in ascending order alphabetically by name. */
  private static nameAscending(a: Project, b: Project): number {
    return b.name.localeCompare(a.name);
  }

  /** Comparator for sorting projects in descending order alphabetically by project ID. */
  private static projectIdDescending(a: Project, b: Project): number {
    return a.projectId.localeCompare(b.projectId);
  }

  /** Comparator for sorting projects in ascending order alphabetically by project ID. */
  private static projectIdAscending(a: Project, b: Project): number {
    return b.projectId.localeCompare(a.projectId);
  }

  /** Comparator for sorting projects in descending order by project number. */
  private static projectNumberDescending(a: Project, b: Project): number {
    return b.projectNumber - a.projectNumber;
  }

  /** Comparator for sorting projects in ascending order by project number. */
  private static projectNumberAscending(a: Project, b: Project): number {
    return a.projectNumber - b.projectNumber;
  }
}

/** The order to sort projects by. */
export enum SortDirection {
  ASCENDING,
  DESCENDING,
}

/** The field to sort project by. */
export enum SortBy {
  /** The IAM Bindings for a given project. */
  IAM_BINDINGS,
  /** The name of a given project. */
  NAME,
  /** The ID of a given project. */
  PROJECT_ID,
  /** The number of a given project. */
  PROJECT_NUMBER,
}
