package com.google.sps.data;

import com.google.sps.data.Recommendation.RecommenderType;

/** Class that provides additional information about IAM Binding recommendations. */
public class IAMRecommenderMetadata extends RecommenderMetadata {

  public int impactInIAMBindings;

  /** 
   *  Creates a {@code IAMRecommenderMetadata} object for a recommendation that
   *  had an impact of {@code impactInIAMBindings} IAM Bindings when applied.  
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
