import {Project} from './project';
import {Organization} from './organization';

/** Contains metadata about both projects and accessible organizations. */
export class ListSummaryData {
  constructor(
    public projects: Project[],
    public organizations: Organization[]
  ) {}
}
