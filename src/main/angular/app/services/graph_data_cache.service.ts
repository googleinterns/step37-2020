import {Injectable} from '@angular/core';
import {DateUtilitiesService} from './date_utilities.service';
import {ProjectGraphData} from '../../model/project_graph_data';
import {OrganizationGraphData} from '../../model/organization_graph_data';

/** Provides the ability to cache project and organization graph data.
 *  An entry will be lazily deleted after six hours. */
@Injectable()
export class GraphDataCacheService {
  private projectCache: {[id: string]: {value: ProjectGraphData; time: Date}};
  private organizationCache: {
    [id: string]: {value: OrganizationGraphData; time: Date};
  };
  constructor(private dateUtilities: DateUtilitiesService) {
    this.projectCache = {};
  }

  /** Returns true if the time is within the last 6 hours, false otherwise. */
  private isValidTime(time: Date): boolean {
    return (
      this.dateUtilities.getDifferenceHours(
        time,
        this.dateUtilities.newDate()
      ) < 6
    );
  }

  /** Checks whether there is an up-to-date project cache entry with the given key. */
  hasProjectEntry(id: string): boolean {
    if (this.projectCache[id] && this.isValidTime(this.projectCache[id].time)) {
      return true;
    }
    return false;
  }

  /** Returns the given entry, or undefined if it doesn't exist or is out-of-date. */
  getProjectEntry(id: string): ProjectGraphData | undefined {
    if (this.hasProjectEntry(id)) {
      return this.projectCache[id].value;
    }
    return undefined;
  }

  /** Adds the given project entry to the cache. */
  addProjectEntry(id: string, data: ProjectGraphData): void {
    this.projectCache[id] = {value: data, time: this.dateUtilities.newDate()};
  }

  /** Checks whether there is an up-to-date organization cache entry with the given key. */
  hasOrganizationEntry(id: string): boolean {
    if (
      this.organizationCache[id] &&
      this.isValidTime(this.organizationCache[id].time)
    ) {
      return true;
    }
    return false;
  }

  /** Returns the given entry, or undefined if it doesn't exist or is out-of-date. */
  getOrganizationEntry(id: string): OrganizationGraphData | undefined {
    if (this.hasOrganizationEntry(id)) {
      return this.organizationCache[id].value;
    }
    return undefined;
  }

  /** Adds the given project entry to the cache. */
  addOrganizationEntry(id: string, data: OrganizationGraphData): void {
    this.organizationCache[id] = {
      value: data,
      time: this.dateUtilities.newDate(),
    };
  }
}
