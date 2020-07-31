import {OrganizationIdentification} from './organization_identification';
import {IAMResource, ResourceType} from './resource';

/** Represents metadata about an organization. */
export class Organization implements IAMResource {
  color: string;
  constructor(
    public identification: OrganizationIdentification,
    public averageBindings: number
  ) {
    this.color = '';
  }

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

  includes(query: string): boolean {
    return this.getName().includes(query) || this.getId().includes(query);
  }
}
