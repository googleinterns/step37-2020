package com.google.impactdashboard.data.recommendation;

import com.google.impactdashboard.data.recommendation.Recommendation.RecommenderType;

/** Abstract class for handling different types of metadata for different recommenders. */
public abstract class RecommenderMetadata {

  /** Returns which type of recommendation this metadata is for. */
  public abstract RecommenderType recommenderType();

}
