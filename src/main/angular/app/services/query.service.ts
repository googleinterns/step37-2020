import {Injectable} from '@angular/core';
import {Project} from '../../model/project';
import {
  SortBy,
  SortDirection,
  ProjectComparators,
  OrganizationComparators,
  getComparator,
} from '../../model/sort_methods';
import {ResourceType} from '../../model/resource';
import {Organization} from '../../model/organization';
import {QueryData} from '../../model/types';

/** Used to query and sort projects/organizations. */
@Injectable()
export class QueryService {
  private queryInformation: {project: QueryData; organization: QueryData};

  /** The resource currently being filtered by. */
  private filterResouce: ResourceType;

  /** All the projects accessible to the user. */
  private projects: Project[];
  /** All the resources accessible to the user. */
  private organizations: Organization[];

  constructor() {
    this.projects = [];
    this.organizations = [];
    this.filterResouce = ResourceType.PROJECT;
    this.queryInformation = {
      organization: {
        cache: [],
        query: '',
        sortBy: SortBy.IAM_BINDINGS,
        sortDirection: SortDirection.DESCENDING,
      },
      project: {
        cache: [],
        query: '',
        sortBy: SortBy.IAM_BINDINGS,
        sortDirection: SortDirection.DESCENDING,
      },
    };
  }

  /** Initialize the query service with the given projects and organizations. */
  init(projects: Project[], organizations: Organization[]) {
    this.filterResouce = ResourceType.PROJECT;
    organizations.sort(
      OrganizationComparators.getComparator(
        SortDirection.DESCENDING,
        SortBy.IAM_BINDINGS
      )
    );
    projects.sort(
      ProjectComparators.getComparator(
        SortDirection.DESCENDING,
        SortBy.IAM_BINDINGS
      )
    );
    this.queryInformation = {
      organization: {
        cache: organizations,
        query: '',
        sortBy: SortBy.IAM_BINDINGS,
        sortDirection: SortDirection.DESCENDING,
      },
      project: {
        cache: projects,
        query: '',
        sortBy: SortBy.IAM_BINDINGS,
        sortDirection: SortDirection.DESCENDING,
      },
    };

    this.projects = projects;
    this.organizations = organizations;
    this.changeField(SortBy.IAM_BINDINGS, SortDirection.DESCENDING);
  }

  /** Returns the query data associated with the currently selected filter resource. */
  private getQueryData(): QueryData {
    if (this.filterResouce === ResourceType.ORGANIZATION) {
      return this.queryInformation.organization;
    } else if (this.filterResouce === ResourceType.PROJECT) {
      return this.queryInformation.project;
    }
  }

  /** Toggle the sorting direction. */
  toggleDirection() {
    const queryData = this.getQueryData();
    queryData.sortDirection =
      queryData.sortDirection === SortDirection.DESCENDING
        ? SortDirection.ASCENDING
        : SortDirection.DESCENDING;

    queryData.cache = queryData.cache.reverse();
  }

  /** Changes the sorting field and direction of the projects. */
  changeField(field: SortBy, direction: SortDirection) {
    const queryData = this.getQueryData();
    queryData.sortBy = field;
    queryData.sortDirection = direction;

    // Since query hasn't changed, we can just re-sort the existing cache
    queryData.cache.sort(getComparator(direction, field, this.filterResouce));
  }

  /** Changes the query string of the projects search. */
  changeQuery(query: string) {
    const queryData = this.getQueryData();

    if (queryData.query === query) {
      // Don't change anything
      return;
    } else if (query.includes(queryData.query)) {
      // New query will be a subset of the existing one and sort will be naturally maintained
      queryData.cache = queryData.cache.filter(project =>
        project.includes(query)
      );
    } else {
      if (this.filterResouce === ResourceType.ORGANIZATION) {
        queryData.cache = this.organizations;
      } else if (this.filterResouce === ResourceType.PROJECT) {
        queryData.cache = this.projects;
      }
      queryData.cache = queryData.cache
        .filter(project => project.includes(query))
        .sort(
          getComparator(
            queryData.sortDirection,
            queryData.sortBy,
            this.filterResouce
          )
        );
    }

    queryData.query = query;
  }

  /** Changes the resource being filtered by. */
  changeResourceType(type: ResourceType) {
    this.filterResouce = type;
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

  /** Get the sorted and queried projects. */
  getProjects(): Project[] {
    // Return a clone
    const temp: Project[] = [];
    return temp.concat(this.queryInformation.project.cache as Project[]);
  }

  /** Get the sorted and queried organizations. */
  getOrganizations(): Organization[] {
    // Return a clone
    const temp: Organization[] = [];
    return temp.concat(
      this.queryInformation.organization.cache as Organization[]
    );
  }

  /** Returns the field being sorted by. */
  getSortField() {
    const queryData = this.getQueryData();
    return queryData.sortBy;
  }

  /** Returns the direction being sorted in. */
  getSortDirection() {
    const queryData = this.getQueryData();
    return queryData.sortDirection;
  }
}
