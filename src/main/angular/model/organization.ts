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
    return Math.round(this.averageBindings);
  }

  getName(): string {
    return this.identification.name;
  }

  getId(): string {
    return this.identification.id;
  }

  getResourceType(): ResourceType {
    return ResourceType.ORGANIZATION;
  }

  includes(query: string): boolean {
    return this.getName().includes(query) || this.getId().includes(query);
  }
}
