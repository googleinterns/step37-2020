import {OrganizationIdentification} from './organization_identification';

/** Represents metadata about an organization. */
export class Organization {
  constructor(
    public identification: OrganizationIdentification,
    public averageBindings: number
  ) {}
}
