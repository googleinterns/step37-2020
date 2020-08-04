package com.google.impactdashboard.database_manager.bigquery;

import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.impactdashboard.configuration.Constants;

/** 
 * A class for building query configuration builder objects and storing them, 
 * so that they only need ot be built once. The query job configuration builder 
 * objects will be configured to query the database with test project information. 
 */
public class QueryConfigurationBuilderFake extends QueryConfigurationBuilder {
  private static final QueryConfigurationBuilderFake INSTANCE = new QueryConfigurationBuilderFake();

  private QueryConfigurationBuilderFake() { 
    super(    
      QueryJobConfiguration.newBuilder(Queries.GET_PROJECT_IDS
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_IDS
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_PROJECT_IDENTIFICATION_INFORMATION
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_IDENTIFICATION_INFORMATION
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_AVERAGE_BINDINGS
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_AVERAGE_BINDINGS
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_DATES_TO_BINDINGS
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_DATES_TO_BINDINGS
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_DATES_TO_IAM_RECOMMENDATIONS
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_DATES_TO_RECOMMENDATIONS
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      Queries.INSERT_VALUES_INTO_IAM_TABLE
        .replace(Constants.DATABASE, Constants.TEST_DATABASE),
      Queries.INSERT_VALUES_INTO_RECOMMENDATIONS_TABLE
        .replace(Constants.DATABASE, Constants.TEST_DATABASE),
      QueryJobConfiguration.newBuilder(Queries.DELETE_OLD_DATA_FROM_IAM_TABLE
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.DELETE_OLD_DATA_FROM_RECOMMENDATIONS_TABLE
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_MOST_RECENT_TIMESTAMP
        .replace(Constants.DATABASE, Constants.TEST_DATABASE))
        .setUseLegacySql(false));
  }

  /** Returns the only instance of the class. */
  public static QueryConfigurationBuilder getInstance() {
    return INSTANCE;
  }
}
