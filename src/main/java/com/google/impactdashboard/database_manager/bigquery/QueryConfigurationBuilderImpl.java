package com.google.impactdashboard.database_manager.bigquery;

import com.google.cloud.bigquery.QueryJobConfiguration;

/** 
 * A class for building query configuration builder objects and storing them, 
 * so that they only need ot be built once. The query job configuration builder 
 * objects will be configured to query the database with real project information. 
 */
public class QueryConfigurationBuilderImpl extends QueryConfigurationBuilder {
  private static final QueryConfigurationBuilderImpl INSTANCE = new QueryConfigurationBuilderImpl();

  private QueryConfigurationBuilderImpl() { 
    super(
      QueryJobConfiguration.newBuilder(Queries.GET_PROJECT_IDS)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_IDS)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_PROJECT_IDENTIFICATION_INFORMATION)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_IDENTIFICATION_INFORMATION)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_AVERAGE_BINDINGS)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_AVERAGE_BINDINGS)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_DATES_TO_BINDINGS)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_DATES_TO_BINDINGS)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_DATES_TO_IAM_RECOMMENDATIONS)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_ORGANIZATION_DATES_TO_RECOMMENDATIONS)
        .setUseLegacySql(false),
      Queries.INSERT_VALUES_INTO_IAM_TABLE,
      Queries.INSERT_VALUES_INTO_RECOMMENDATIONS_TABLE,
      QueryJobConfiguration.newBuilder(Queries.DELETE_OLD_DATA_FROM_IAM_TABLE)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.DELETE_OLD_DATA_FROM_RECOMMENDATIONS_TABLE)
        .setUseLegacySql(false),
      QueryJobConfiguration.newBuilder(Queries.GET_MOST_RECENT_TIMESTAMP)
        .setUseLegacySql(false));
  }

  /** Returns the only instance of the class. */
  public static QueryConfigurationBuilder getInstance() {
    return INSTANCE;
  }
}
