/** Represents a resource that can be selected. E.g. projects, organizations */
export interface Resource {
  /** The color to display on the graph. */
  color: string;
  /** Returns the name of the given resource. */
  getName(): string;
  /** Returns the ID of the given resource */
  getId(): string;
  /** Returns the type of the given resource. */
  getResourceType(): ResourceType;
  /** Whether the given string is included within the resource. */
  includes(query: string): boolean;
}

/** Represents a resource that has IAM Bindings */
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IAMResource extends Resource {
  /** Returns the average number of bindings for the given resource */
  getAverageBindings(): number;
}

/** The type of resource currently being used. */
export enum ResourceType {
  PROJECT,
  ORGANIZATION,
}
