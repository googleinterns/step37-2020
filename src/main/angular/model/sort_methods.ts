import {Project} from './project';
import {Organization} from './organization';
import {ResourceType} from './resource';

/** Contains comparators for sorting. */
export class ProjectComparators {
  static getComparator(order: SortDirection, field: SortBy) {
    if (order === SortDirection.ASCENDING) {
      switch (field) {
        case SortBy.IAM_BINDINGS:
          return this.iamAscending;
        case SortBy.NAME:
          return this.nameAscending;
        case SortBy.ID:
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
        case SortBy.ID:
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
        case SortBy.NAME:
          return this.nameAscending;
        case SortBy.ID:
          return this.idAscending;
      }
    } else {
      switch (field) {
        case SortBy.IAM_BINDINGS:
          return this.iamDescending;
        case SortBy.NAME:
          return this.nameDescending;
        case SortBy.ID:
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

export function getComparator(
  order: SortDirection,
  field: SortBy,
  type: ResourceType
) {
  if (type === ResourceType.ORGANIZATION) {
    return OrganizationComparators.getComparator(order, field);
  } else if (type === ResourceType.PROJECT) {
    return ProjectComparators.getComparator(order, field);
  }
}

/** The order to sort by. */
export enum SortDirection {
  ASCENDING,
  DESCENDING,
}

/** The field to sort by. */
export enum SortBy {
  /** The IAM Bindings for a given resource. */
  IAM_BINDINGS,
  /** The name of a given resource. */
  NAME,
  /** The ID of a given resource. */
  ID,
  /** The number of a given project. */
  PROJECT_NUMBER,
}
