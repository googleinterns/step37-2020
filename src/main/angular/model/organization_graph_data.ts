import {OrganizationIdentification} from './organization_identification';
import {Recommendation} from './recommendation';

/** Represents graph data for an organization. */
export class OrganizationGraphData {
  constructor(
    public identification: OrganizationIdentification,
    public datesToBindings: {[time: number]: number},
    public datesToRecommendations: {[time: number]: Recommendation}
  ) {}
}
