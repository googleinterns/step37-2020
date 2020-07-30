package com.google.impactdashboard.data.recommendation;

import com.google.impactdashboard.data.recommendation.Recommendation.RecommenderType;
import com.google.auto.value.AutoValue;

/** Class that provides additional information about IAM Binding recommendations. */
@AutoValue
public abstract class IAMRecommenderMetadata extends RecommenderMetadata {

  public abstract int getImpactInIAMBindings();

  /** 
   *  Creates a {@code IAMRecommenderMetadata} object for a recommendation that
   *  had an impact of {@code impactInIAMBindings} IAM Bindings when applied.
   *  Impact retrieved via the Recommender API: 
   *  https://cloud.google.com/recommender/docs/reference/rpc/google.cloud.recommender.v1#google.cloud.recommender.v1.Recommendation  
   */
  public static IAMRecommenderMetadata create(int impactInIAMBindings) {
    return new AutoValue_IAMRecommenderMetadata(impactInIAMBindings);
  }

  /** Returns which type of recommendation this metadata is for. */
  @Override 
  public RecommenderType recommenderType() {
    return Recommendation.RecommenderType.IAM_BINDING;
  }
}
