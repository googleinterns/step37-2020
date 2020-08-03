import {Recommendation} from './recommendation';
import {ResourceType} from './resource';
import {RecommenderType} from './recommender_type';

/** Represents graph data for a particular resource. */
export interface ResourceGraphData {
  /** Return the ID of the associated resource. */
  getId(): string;
  /** Returns the map of milliseconds since epoch to recommendations. */
  getDateToRecommendation(): {[key: number]: Recommendation};
  /** Returns the type of the given resource. */
  getResourceType(): ResourceType;
  /** Returns the type of data for this resource. */
  getRecommenderType(): RecommenderType;
}

/** Represents graph data for a resource that has graph data. */
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IAMResourceGraphData extends ResourceGraphData {
  /** Returns a mapping from milliseconds since epoch to IAM Bindings. */
  getDateToBindings(): {[key: number]: number};
}
