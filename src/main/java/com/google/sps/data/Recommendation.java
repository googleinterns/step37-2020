package com.google.sps.data;

/** Represents a GCP Recommendation. */
public class Recommendation {

  public String projectId;
  public String description;
  public RecommenderType recommender;
  public long acceptedTimestamp;
  public RecommenderMetadata metadata;

  public enum RecommenderType {
    IAM_BINDING;
  }

  /** 
   * Creates a {@code Recommendation} representing a GCP recommendation for
   * project {@code projectId}, which was recommended by {@code recommender} 
   * and accepted by the user at time {@code timestamp}, with description 
   * {@code description} and additional metadata {@code metadata}.
   */
  public Recommendation(String projectId, String description, RecommenderType recommender, 
    long acceptedTimestamp, RecommenderMetadata metadata)  {
    this.projectId = projectId;
    this.description = description;
    this.recommender = recommender;
    this.acceptedTimestamp = acceptedTimestamp;
    this.metadata = metadata;
  }
}
