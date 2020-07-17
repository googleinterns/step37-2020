package com.google.impactdashboard.data.recommendation;

import com.google.auto.value.AutoValue;
import java.util.List;

/** Represents a GCP Recommendation. */
@AutoValue
public abstract class Recommendation {

  public abstract String getProjectId();
  public abstract String getActor();
  public abstract List<RecommendationAction> getActions();
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
  public static Recommendation create(String projectId, String actor, 
    List<RecommendationAction> actions, RecommenderType recommender, 
    long acceptedTimestamp, RecommenderMetadata metadata)  {
    return new AutoValue_Recommendation(projectId, actor, actions, recommender, 
      acceptedTimestamp, metadata);
  }
}
