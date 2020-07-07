package com.google.impactdashboard.configuration;

/** A class to hold constants used throughout the project. */
public class Constants {

  /** The project id of the project being used to deploy this webapp. */
  public static final String PROJECT_ID = "concord-intern";

  /** The path to the service account key. */
  public static final String PATH_TO_SERVICE_ACCOUNT_KEY = 
    "/usr/local/google/home/carolinelui/Downloads/concord-intern-10ce059284ad.json";

  /** The name of the table holding recommendations data. */
  public static final String RECOMMENDATIONS_TABLE = "Recommendations";

  /** The name of the table holding Iam Bindings data. */
  public static final String IAM_BINDINGS_TABLE = "IAM_Bindings";

  /** The name of the database holding the test data. */
  public static final String TEST_DATABASE = "Test_Capstone";

  /** The name of the database holding the real data. */
  public static final String DATABASE = "";

  /* Column names of Recommendations Table. */

  /** The name of the column holding the project id. */
  public static final String PROJECT_ID_COLUMN_RECOMMENDATIONS = "ProjectId";

  /** The name of the column holding the recommender type. */
  public static final String RECOMMENDER_COLUMN = "Recommender";

  /** The name of the column holding the description of the recommendation. */
  public static final String DESCRIPTION_COLUMN = "Description";

  /** The name of the column holding the accepted timestamp of the recommendation. */
  public static final String ACCEPTED_TIMESTAMP_COLUMN = "AcceptedTimestamp";

  /** The name of the column holding the IAM bindings impact of the recommendation. */
  public static final String IAM_IMPACT_COLUMN = "IAMBindingsImpact";

  /* Column names of IAM Bindings Table. */

  /** The name of the column holding the project id. */
  public static final String PROJECT_ID_COLUMN_IAM = "ProjectId";

  /** The name of the column holding the name of the project. */
  public static final String NAME_COLUMN = "ProjectName";

  /** The name of the column holding the number of the project. */
  public static final String NUMBER_COLUMN = "ProjectNumber";

  /** The name of the column holding the timestamp of the bindings data. */
  public static final String TIMESTAMP_COLUMN = "Timestamp";

  /** The name of the column holding the number of IAM Bindings. */
  public static final String NUMBER_BINDINGS_COLUMN = "NumberOfBindings";

  
}