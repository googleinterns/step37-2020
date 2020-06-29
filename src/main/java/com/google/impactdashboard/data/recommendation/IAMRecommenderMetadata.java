package com.google.impactdashboard.data.recommendation;

import com.google.impactdashboard.data.recommendation.Recommendation.RecommenderType;

/** Class that provides additional information about IAM Binding recommendations. */
public class IAMRecommenderMetadata extends RecommenderMetadata {

  public int impactInIAMBindings;

  /** 
   *  Creates a {@code IAMRecommenderMetadata} object for a recommendation that
   *  had an impact of {@code impactInIAMBindings} IAM Bindings when applied.
   *  Impact retrieved via the Recommender API: 
   *  https://cloud.google.com/recommender/docs/reference/rpc/google.cloud.recommender.v1#google.cloud.recommender.v1.Recommendation  
   */
  public IAMRecommenderMetadata(int impactInIAMBindings) {
    this.impactInIAMBindings = impactInIAMBindings;
  }

  /** Returns which type of recommendation this metadata is for. */
  @Override 
  public RecommenderType recommenderType() {
    return Recommendation.RecommenderType.IAM_BINDING;
  }
}
