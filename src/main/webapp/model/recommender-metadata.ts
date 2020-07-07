/** Handles different types of recommendations */
export abstract class RecommenderMetadata {}

/** Metadata specifically for IAM Bindings */
export class IAMRecommenderMetadata extends RecommenderMetadata {
  impactInIAMBindings: number;

  constructor(impactInIAMBindings: number) {
    super();
    this.impactInIAMBindings = impactInIAMBindings;
  }
}
