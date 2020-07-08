package com.google.impactdashboard.database_manager.bigquery;

import com.google.impactdashboard.configuration.*;
import com.google.impactdashboard.data.recommendation.Recommendation;

/** A class to hold all of the queries needed by DataReadManager and DataUpdateManager. */
public class Queries {

  /** 
   * Based on system Configuration flags, set to the value of the IAM bindings 
   * table in the database that should be queried. 
   */
  private static final String IAM_TABLE = Constants.PROJECT_ID + "." + 
    Constants.DATABASE + "." + Constants.IAM_BINDINGS_TABLE;
  

  /** 
   * Based on system Configuration flags, set to the value of the recommendations 
   * table in the database that should be queried. 
   */
  private static final String RECOMMENDATIONS_TABLE = Constants.PROJECT_ID + "." + 
    Constants.DATABASE + "." + Constants.RECOMMENDATIONS_TABLE;

  /** Retrieves all project ids from the database. */
  public static final String GET_PROJECT_IDS = 
    "SELECT DISTINCT " + Constants.IAM_PROJECT_ID_COLUMN +
      " FROM `" + IAM_TABLE + "`";

  /** 
   * Retrieves the project name and project number of the project with id 
   * {@code projectId}. 
   */
  public static final String GET_PROJECT_IDENTIFICATION_INFORMATION = 
    "SELECT " + 
      Constants.PROJECT_NAME_COLUMN + ", " + 
      Constants.PROJECT_NUMBER_COLUMN +
      " FROM `" + IAM_TABLE + "`" +
      " WHERE " + Constants.IAM_PROJECT_ID_COLUMN + " = @projectId" +
      " LIMIT 1";

  /** 
   * Retrieves the average number of bindings for {@code projectId} for every 
   * entry in the table. 
   */
  public static final String GET_AVERAGE_BINDINGS = 
    "SELECT AVG(" + Constants.NUMBER_BINDINGS_COLUMN + ") AS AverageBindings" +
      " FROM " + IAM_TABLE + 
      " GROUP BY " + Constants.IAM_PROJECT_ID_COLUMN +
      " HAVING " + Constants.IAM_PROJECT_ID_COLUMN + " = @projectId";

  /** 
   * Retrieves all (timestamp, number of bindings) data in the table for 
   * {@code projectId}. 
   */
  public static final String GET_DATES_TO_BINDINGS = 
    "SELECT " + Constants.TIMESTAMP_COLUMN + ", " + Constants.NUMBER_BINDINGS_COLUMN +
      " FROM " + IAM_TABLE +
      " WHERE " + Constants.IAM_PROJECT_ID_COLUMN + " = @projectId";

  /** 
   * Retrieves all (timestamp, recommendation) data in the table for 
   * {@code projectId}. 
   */
  public static final String GET_DATES_TO_IAM_RECOMMENDATIONS = 
    "SELECT " + 
      Constants.ACCEPTED_TIMESTAMP_COLUMN + ", " +
      Constants.DESCRIPTION_COLUMN + ", " +
      Constants.IAM_IMPACT_COLUMN +
      " FROM " + RECOMMENDATIONS_TABLE +
      " WHERE " + Constants.RECOMMENDATIONS_PROJECT_ID_COLUMN + " = @projectId" +
      " AND " + Constants.RECOMMENDER_COLUMN + 
        " = '" + Recommendation.RecommenderType.IAM_BINDING + "'";

  /** 
   * Inserts values (which will need to be concatenated to this string) into the 
   * Recommendations table. 
   */
  public static final String INSERT_VALUES_INTO_RECOMMENDATIONS_TABLE = 
    "INSERT INTO `" + RECOMMENDATIONS_TABLE + "`" +
      " VALUES "; 

  /** 
   * Inserts values (which will need to be concatenated to this string) into the 
   * IAM Bindings table. 
   */
  public static final String INSERT_VALUES_INTO_IAM_TABLE = 
    "INSERT INTO `" + IAM_TABLE + "`" +
      " VALUES ";

  /** Deletes 365-day-old data from the IAM bindings table. */
  public static final String DELETE_OLD_DATA_FROM_IAM_TABLE = 
    "DELETE FROM `" + IAM_TABLE + "`" +
      " WHERE " + Constants.TIMESTAMP_COLUMN + " < " + 
        " TIMESTAMP_SUB(" +
          "(SELECT MAX(" + Constants.TIMESTAMP_COLUMN + ")" +
            " FROM " + IAM_TABLE + ")," +
        " INTERVAL 365 DAY)";

  /** Deletes 365-day-old data from the recommendations table. */
  public static final String DELETE_OLD_DATA_FROM_RECOMMENDATIONS_TABLE = 
  "DELETE FROM `" + RECOMMENDATIONS_TABLE + "`" +
  " WHERE " + Constants.ACCEPTED_TIMESTAMP_COLUMN + " < " + 
    " TIMESTAMP_SUB(" +
      "(SELECT MAX(" + Constants.TIMESTAMP_COLUMN + ")" +
        " FROM " + IAM_TABLE + ")," +
    " INTERVAL 365 DAY)";
  
}
