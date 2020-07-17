/** Represents a single action that a recommendation implemented. */
export class RecommendationAction {
  constructor(
    private affectedAccount: string,
    private previousRole: string,
    private newRole: string
  ) {}

  /** Converts the given action to a string that is visible to the user. */
  public toString(): string {
    if (this.newRole.length > 0) {
      // Role was replaced
      return `Replace ${this.previousRole} with ${this.newRole} on ${this.affectedAccount}.`;
    }
    // Role was removed
    return `Remove ${this.previousRole} from ${this.affectedAccount}.`;
  }
}
