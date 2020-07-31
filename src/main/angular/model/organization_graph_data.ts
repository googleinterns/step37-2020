import {Recommendation} from './recommendation';
import {IAMResourceGraphData} from './resource_graph_data';
import {ResourceType} from './resource';
import {RecommenderType} from './recommender_type';

/** Represents graph data for an organization. */
export class OrganizationGraphData implements IAMResourceGraphData {
  constructor(
    public organizationId: string,
    public datesToBindings: {[time: number]: number},
    public datesToRecommendations: {[time: number]: Recommendation}
  ) {}

  getDateToBindings(): {[key: number]: number} {
    return this.datesToBindings;
  }

  getId(): string {
    return this.organizationId;
  }

  getDateToRecommendation(): {[key: number]: Recommendation} {
    return this.datesToRecommendations;
  }

  getResourceType(): ResourceType {
    return ResourceType.ORGANIZATION;
  }

  getRecommenderType(): RecommenderType {
    return RecommenderType.IAM_BINDING;
  }
}
