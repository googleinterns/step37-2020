import {OrganizationIdentification} from './organization_identification';
import {IAMResource, ResourceType} from './resource';

/** Represents metadata about an organization. */
export class Organization implements IAMResource {
  constructor(
    public identification: OrganizationIdentification,
    public averageBindings: number
  ) {}

  getAverageBindings(): number {
    return this.averageBindings;
  }

  getName(): string {
    return this.identification.organizationName;
  }

  getId(): string {
    return this.identification.organizationId;
  }

  getResourceType(): ResourceType {
    return ResourceType.ORGANIZATION;
  }
}
