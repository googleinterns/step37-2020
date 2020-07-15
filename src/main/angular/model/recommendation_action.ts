/** Represents a single action that a recommendation implemented. */
export class RecommendationAction {
  constructor(
    private affectedAccount: string,
    private previousRole: string,
    private newRole: string
  ) {}

  /** Converts the given action to a string that is visible to the user. */
  public toString(): string {
    return '';
  }
}
