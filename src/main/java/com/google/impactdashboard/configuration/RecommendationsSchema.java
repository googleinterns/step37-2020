package com.google.impactdashboard.configuration;

/** A class to hold the column names in the Recommendations Table. */
public class RecommendationsSchema {
  /** The name of the column holding the project id. */
  public static final String RECOMMENDATIONS_PROJECT_ID_COLUMN = "ProjectId";

  /** The name of the column holding the recommender type. */
  public static final String RECOMMENDER_COLUMN = "Recommender";

  /** The name of the column holding the name of the user that accepted the recommendation. */
  public static final String ACTOR_COLUMN = "Actor";

  /** The name of the column holding the actions taken by the recommendation. */
  public static final String ACTIONS_COLUMN = "Actions";

  /** 
   * The name of the field of the recommendation action struct that 
   * indicates which user account was affected by the action. 
   */
  public static final String ACCOUNT_AFFECTED_FIELD = "AffectedAccount";

  /** 
   * The name of the field of the recommendation action struct that 
   * indicates Which role this user previously had.
   */
  public static final String PREVIOUS_ROLE_FIELD = "PreviousRole";

  /** 
   * The name of the field of the recommendation action struct that 
   * indicates which role this user currently has.
   */
  public static final String NEW_ROLE_FIELD = "NewRole";


  /** The name of the column holding the accepted timestamp of the recommendation. */
  public static final String ACCEPTED_TIMESTAMP_COLUMN = "AcceptedTimestamp";

  /** The name of the column holding the IAM bindings impact of the recommendation. */
  public static final String IAM_IMPACT_COLUMN = "IAMBindingsImpact";
}
