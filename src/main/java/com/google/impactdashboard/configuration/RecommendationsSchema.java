package com.google.impactdashboard.configuration;

/** A class to hold the column names in the Recommendations Table. */
public class RecommendationsSchema {
  /** The name of the column holding the project id. */
  public static final String RECOMMENDATIONS_PROJECT_ID_COLUMN = "ProjectId";

  /** The name of the column holding the recommender type. */
  public static final String RECOMMENDER_COLUMN = "Recommender";

  /** The name of the column holding the description of the recommendation. */
  public static final String DESCRIPTION_COLUMN = "Description";

  /** The name of the column holding the accepted timestamp of the recommendation. */
  public static final String ACCEPTED_TIMESTAMP_COLUMN = "AcceptedTimestamp";

  /** The name of the column holding the IAM bindings impact of the recommendation. */
  public static final String IAM_IMPACT_COLUMN = "IAMBindingsImpact";
}