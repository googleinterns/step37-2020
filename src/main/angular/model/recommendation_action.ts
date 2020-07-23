/** Represents a single action that a recommendation implemented. */
export class RecommendationAction {
  constructor(
    public affectedAccount: string,
    public previousRole: string,
    public newRole: string,
    public actionType: string
  ) {}
}
