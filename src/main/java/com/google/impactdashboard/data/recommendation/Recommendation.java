package com.google.impactdashboard.data.recommendation;

import com.google.auto.value.AutoValue;

/** Represents a GCP Recommendation. */
@AutoValue
public abstract class Recommendation {

  public abstract String getProjectId();
  public abstract String getDescription();
  public abstract RecommenderType getRecommender();
  public abstract long getAcceptedTimestamp();
  public abstract RecommenderMetadata getMetadata();

  public enum RecommenderType {
    IAM_BINDING;
  }

  /** 
   * Creates a {@code Recommendation} representing a GCP recommendation for
   * project {@code projectId}, which was recommended by {@code recommender} 
   * and accepted by the user at time {@code timestamp}, with description 
   * {@code description} and additional metadata {@code metadata}.
   */
  public static Recommendation create(String projectId, String description, 
    RecommenderType recommender, long acceptedTimestamp, RecommenderMetadata metadata)  {
    return new AutoValue_Recommendation(projectId, description, recommender, 
      acceptedTimestamp, metadata);
  }
}
