import {Injectable} from '@angular/core';
import {DateUtilitiesService} from './date_utilities.service';
import {ProjectGraphData} from '../../model/project_graph_data';

/** Provides the ability to cache graph data. An entry will be lazily deleted after six hours. */
@Injectable()
export class GraphDataCacheService {
  private cache: {[id: string]: {value: ProjectGraphData; time: Date}};
  constructor(private dateUtilities: DateUtilitiesService) {
    this.cache = {};
  }

  /** Checks whether there is an up-to-date cache entry with the given key. */
  hasEntry(id: string): boolean {
    if (
      this.cache[id] &&
      this.dateUtilities.getDifferenceHours(
        this.cache[id].time,
        this.dateUtilities.newDate()
      ) < 6
    ) {
      return true;
    }
    return false;
  }

  /** Returns the given entry, or undefined if it doesn't exist or is out-of-date. */
  getEntry(id: string): ProjectGraphData | undefined {
    if (this.hasEntry(id)) {
      return this.cache[id].value;
    }
    return undefined;
  }

  /** Adds the given entry to the cache. */
  addEntry(id: string, data: ProjectGraphData): void {
    this.cache[id] = {value: data, time: this.dateUtilities.newDate()};
  }
}
