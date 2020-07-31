package com.google.impactdashboard.configuration;

/** A class to hold constants used throughout the project. */
public class Constants {

  /** The project id of the project being used to deploy this webapp. */
  public static final String PROJECT_ID = "concord-intern";

  /** The path to the service account key. */
  public static final String PATH_TO_SERVICE_ACCOUNT_KEY = 
    "/usr/local/google/home/ionis/Downloads/key.json";

  /** The name of the table holding recommendations data. */
  public static final String RECOMMENDATIONS_TABLE = "Recommendations";

  /** The name of the table holding Iam Bindings data. */
  public static final String IAM_BINDINGS_TABLE = "IAM_Bindings";

  /** The name of the empty table with the IAM Bindings schema. */
  public static final String EMPTY_IAM_BINDINGS_TABLE = "Empty_IAM_Bindings";

  /** The name of the empty table with the Recommendations schema. */
  public static final String EMPTY_RECOMMENDATIONS_TABLE = "Empty_Recommendations";

  /** The name of the database holding the test data. */
  public static final String TEST_DATABASE = "Test_Dashboard_V2";

  /** The name of the database holding the real data. */
  public static final String DATABASE = "Rec_Impact_Dashboard_V2";
}
