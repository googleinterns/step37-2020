import {Injectable} from '@angular/core';
import {Project} from '../../model/project';
import {
  SortBy,
  SortDirection,
  ProjectComparators,
  OrganizationComparators,
  getComparator,
} from '../../model/sort_methods';
import {Resource, ResourceType} from '../../model/resource';
import {Organization} from '../../model/organization';

/** Used to query and sort projects/organizations. */
@Injectable()
export class QueryService {
  private sortBy: SortBy;
  private sortDirection: SortDirection;
  private query: string;
  /** The resource type to filter by. */
  private filterResouce: ResourceType;
  /** Cached version of the active resource, sorted and filtered. */
  private cache: Resource[];

  /** All the projects accessible to the user. */
  private projects: Project[];
  /** All the resources accessible to the user. */
  private organizations: Organization[];

  constructor() {
    this.sortBy = SortBy.IAM_BINDINGS;
    this.sortDirection = SortDirection.DESCENDING;
    this.query = '';
    this.projects = [];
    this.cache = [];
    this.filterResouce = ResourceType.PROJECT;
  }

  /** Initialize the query service with the given projects and organizations. */
  init(projects: Project[], organizations: Organization[]) {
    projects.sort(
      ProjectComparators.getComparator(
        SortDirection.DESCENDING,
        SortBy.IAM_BINDINGS
      )
    );
    organizations.sort(
      OrganizationComparators.getComparator(
        SortDirection.DESCENDING,
        SortBy.IAM_BINDINGS
      )
    );
    this.projects = projects;
    this.organizations = organizations;
    this.cache = projects;
    this.changeField(SortBy.IAM_BINDINGS, SortDirection.DESCENDING);
  }

  /** Toggle the sorting direction. */
  toggleDirection() {
    this.sortDirection =
      this.sortDirection === SortDirection.DESCENDING
        ? SortDirection.ASCENDING
        : SortDirection.DESCENDING;

    this.cache = this.cache.reverse();
  }

  /** Changes the sorting field and direction of the projects. */
  changeField(field: SortBy, direction: SortDirection) {
    this.sortBy = field;
    this.sortDirection = direction;

    // Since query hasn't changed, we can just re-sort the existing cache
    this.cache.sort(getComparator(direction, field, this.filterResouce));
  }

  /** Changes the query string of the projects search. */
  changeQuery(query: string) {
    if (this.query === query) {
      // Don't change anything
      return;
    } else if (query.includes(this.query)) {
      // New query will be a subset of the existing one and sort will be naturally maintained
      this.cache = this.cache.filter(project => project.includes(query));
    } else {
      if (this.filterResouce === ResourceType.ORGANIZATION) {
        this.cache = this.organizations;
      } else if (this.filterResouce === ResourceType.PROJECT) {
        this.cache = this.projects;
      }
      this.cache = this.cache
        .filter(project => project.includes(query))
        .sort(
          getComparator(this.sortDirection, this.sortBy, this.filterResouce)
        );
    }

    this.query = query;
  }

  /** Changes the resource being filtered by. Will maintain sort and filtering. */
  changeResourceType(type: ResourceType) {
    if (type !== this.filterResouce) {
      this.filterResouce = type;
      if (type === ResourceType.ORGANIZATION) {
        this.cache = this.organizations;
      } else if (type === ResourceType.PROJECT) {
        this.cache = this.projects;
      }
      this.cache.sort(getComparator(this.sortDirection, this.sortBy, type));
      const queryStore = this.query;
      this.query = '';
      this.changeQuery(queryStore);
    }
  }

  /** Assign the given colors to the resources as they're currently sorted. */
  assignColors(colors: string[]): void {
    this.projects.forEach(
      (project, i) => (project.color = colors[i % colors.length])
    );
    this.organizations.forEach(
      (organization, i) => (organization.color = colors[i % colors.length])
    );
  }

  /** Get the sorted and queried resources. */
  getResources(): Resource[] {
    // Return a clone
    const temp: Resource[] = [];
    return temp.concat(this.cache);
  }

  /** Returns the field being sorted by. */
  getSortField() {
    return this.sortBy;
  }

  /** Returns the direction being sorted in. */
  getSortDirection() {
    return this.sortDirection;
  }
}
