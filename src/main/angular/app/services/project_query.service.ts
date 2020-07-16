import {Injectable} from '@angular/core';
import {Project} from '../../model/project';
import {
  SortBy,
  SortDirection,
  ProjectComparators,
} from '../../model/project_sort';

/** Used to query and sort projects. */
@Injectable()
export class ProjectQueryService {
  private sortBy: SortBy;
  private sortDirection: SortDirection;

  private query: string;
  /** All the projects accessible to the user. */
  private projects: Project[];
  /** Cached version of the projects, sorted and filtered. */
  private projectsCache: Project[];

  constructor() {
    this.sortBy = SortBy.IAM_BINDINGS;
    this.sortDirection = SortDirection.DESCENDING;
    this.query = '';
    this.projects = [];
    this.projectsCache = [];
  }

  /** Initialize the query service with the given projects. */
  init(projects: Project[]) {
    this.projects = projects;
    this.projectsCache = projects;
    this.changeField(SortBy.IAM_BINDINGS, SortDirection.DESCENDING);
  }

  /** Toggle the sorting direction. */
  toggleDirection() {
    this.sortDirection =
      this.sortDirection === SortDirection.DESCENDING
        ? SortDirection.ASCENDING
        : SortDirection.DESCENDING;

    this.projectsCache = this.projectsCache.reverse();
  }

  /** Changes the sorting field and direction of the projects. */
  changeField(field: SortBy, direction: SortDirection) {
    this.sortBy = field;
    this.sortDirection = direction;

    // Since query hasn't changed, we can just re-sort the existing cache
    this.projectsCache.sort(ProjectComparators.getComparator(direction, field));
  }

  /** Changes the query string of the projects search. */
  changeQuery(query: string) {
    if (this.query === query) {
      // Don't change anything
      return;
    } else if (query.includes(this.query)) {
      // New query will be a subset of the existing one
      this.projectsCache = this.projectsCache.filter(project =>
        project.includes(query)
      );
    } else {
      this.projectsCache = this.projects.filter(project =>
        project.includes(query)
      );
    }

    this.query = query;
  }

  /** Get the sorted and queried projects. */
  getProjects(): Project[] {
    // Return a clone
    const temp: Project[] = [];
    return temp.concat(this.projectsCache);
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
