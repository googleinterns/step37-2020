import {Project} from './project';
import {Organization} from './organization';

/** Contains comparators for sorting projects. */
export class ProjectComparators {
  static getComparator(order: SortDirection, field: SortBy) {
    if (order === SortDirection.ASCENDING) {
      switch (field) {
        case SortBy.IAM_BINDINGS:
          return this.iamAscending;
        case SortBy.PROJECT_NAME:
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
        case SortBy.PROJECT_NAME:
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

/** Contains comparators for sorting organizations */
export class OrganizationComparators {
  static getComparator(order: SortDirection, field: SortBy) {
    if (order === SortDirection.ASCENDING) {
      switch (field) {
        case SortBy.IAM_BINDINGS:
          return this.iamAscending;
        case SortBy.ORGANIZATION_NAME:
          return this.nameAscending;
        case SortBy.ORGANIZATION_ID:
          return this.idAscending;
      }
    } else {
      switch (field) {
        case SortBy.IAM_BINDINGS:
          return this.iamDescending;
        case SortBy.ORGANIZATION_NAME:
          return this.nameDescending;
        case SortBy.ORGANIZATION_ID:
          return this.idDescending;
      }
    }
  }

  /** Comparator for sorting organizations in descending order by IAM Bindings. */
  private static iamDescending(a: Organization, b: Organization): number {
    return b.averageBindings - a.averageBindings;
  }

  /** Comparator for sorting organizations in ascending order by IAM Bindings. */
  private static iamAscending(a: Organization, b: Organization): number {
    return a.averageBindings - b.averageBindings;
  }

  /** Comparator for sorting organizations in descending order alphabetically by name. */
  private static nameDescending(a: Organization, b: Organization): number {
    return a.identification.organizationName.localeCompare(
      b.identification.organizationName
    );
  }

  /** Comparator for sorting organizations in ascending order alphabetically by name. */
  private static nameAscending(a: Organization, b: Organization): number {
    return b.identification.organizationName.localeCompare(
      a.identification.organizationName
    );
  }

  /** Comparator for sorting organizations in descending order alphabetically by id. */
  private static idDescending(a: Organization, b: Organization): number {
    return a.identification.organizationId.localeCompare(
      b.identification.organizationId
    );
  }

  /** Comparator for sorting organizations in ascending order alphabetically by id. */
  private static idAscending(a: Organization, b: Organization): number {
    return b.identification.organizationId.localeCompare(
      a.identification.organizationId
    );
  }
}

/** The order to sort by. */
export enum SortDirection {
  ASCENDING,
  DESCENDING,
}

/** The field to sort project by. */
export enum SortBy {
  /** The IAM Bindings for a given project. */
  IAM_BINDINGS,
  /** The name of a given project. */
  PROJECT_NAME,
  /** The ID of a given project. */
  PROJECT_ID,
  /** The number of a given project. */
  PROJECT_NUMBER,
  /** The ID of a given organization. */
  ORGANIZATION_ID,
  /** The name of a given organization. */
  ORGANIZATION_NAME,
}
