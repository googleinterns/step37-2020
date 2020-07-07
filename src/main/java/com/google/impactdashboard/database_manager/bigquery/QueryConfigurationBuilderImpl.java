package com.google.impactdashboard.database_manager.bigquery;

import com.google.cloud.bigquery.QueryJobConfiguration;

/** 
 * A class for building query configuration builder objects and storing them, 
 * so that they only need ot be built once. The query job configuration builder 
 * objects will be configured to query the database with real project information. 
 */
public class QueryConfigurationBuilderImpl implements QueryConfigurationBuilder {
  private static final QueryConfigurationBuilderImpl INSTANCE = new QueryConfigurationBuilderImpl();
  
  private QueryJobConfiguration.Builder getProjectIdsConfiguration = null;
  private QueryJobConfiguration.Builder getProjectIdentificationInformationConfiguration = null;
  private QueryJobConfiguration.Builder getAverageBindingsConfiguration = null;
  private QueryJobConfiguration.Builder getDatesToBindingsConfiguration = null;
  private QueryJobConfiguration.Builder getDatesToIAMRecommendationsConfiguration = null;
  private String insertValuesIAMTableConfiguration = null;
  private String insertValuesRecommendationsTableConfiguration = null;
  private QueryJobConfiguration.Builder deleteOldDataIAMTableConfiguration = null;
  private QueryJobConfiguration.Builder deleteOldDataRecommendationsTableConfiguration = null;

  private QueryConfigurationBuilderImpl() { }

  /** Returns the only instance of the class. */
  public static QueryConfigurationBuilder getInstance() {
    return INSTANCE;
  }

  /** 
   * Retrieves query job configuration that retrieves all project ids from the 
   * database. 
   */
  public QueryJobConfiguration.Builder getProjectIdsConfiguration() {
    if (getProjectIdsConfiguration == null) {
      getProjectIdsConfiguration = QueryJobConfiguration
      .newBuilder(Queries.GET_PROJECT_IDS).setUseLegacySql(false);
    }

    return getProjectIdsConfiguration;
  }

  /** 
   * Retrieves parameterized query job configuration that retrieves the 
   * identifying information for a single project from the database.
   */
  public QueryJobConfiguration.Builder getProjectIdentificationInformationConfiguration() {
    if (getProjectIdentificationInformationConfiguration == null) {
      getProjectIdentificationInformationConfiguration = QueryJobConfiguration
      .newBuilder(Queries.GET_PROJECT_IDENTIFICATION_INFORMATION).setUseLegacySql(false);
    }

    return getProjectIdentificationInformationConfiguration;
  }

  /** 
   * Retrieves parameterized query job configuration that retrieves the 
   * average number of bindings for a single project for every entry in the table. 
   */
  public QueryJobConfiguration.Builder getAverageBindingsConfiguration() {
    if (getAverageBindingsConfiguration == null) {
      getAverageBindingsConfiguration = QueryJobConfiguration
      .newBuilder(Queries.GET_AVERAGE_BINDINGS).setUseLegacySql(false);
    }

    return getAverageBindingsConfiguration;
  }

  /**
   * Retrieves parameterized query job configuration that retrieves all 
   * (timestamp, number of bindings) data in tetheh table for a single project. 
   */
  public QueryJobConfiguration.Builder getDatesToBindingsConfiguration() {
    if (getDatesToBindingsConfiguration == null) {
      getDatesToBindingsConfiguration = QueryJobConfiguration
      .newBuilder(Queries.GET_DATES_TO_BINDINGS).setUseLegacySql(false);
    }

    return getDatesToBindingsConfiguration;
  }

  /**
   * Retrieves parameterized query job configuration that retrieves all 
   * (timestamp, recomendation) data in the table for a single project, from the 
   * IAM Bindings Recommender.
   */
  public QueryJobConfiguration.Builder getDatesToIAMRecommendationsConfiguration() {
    if (getDatesToIAMRecommendationsConfiguration == null) {
      getDatesToIAMRecommendationsConfiguration = QueryJobConfiguration
      .newBuilder(Queries.GET_DATES_TO_IAM_RECOMMENDATIONS).setUseLegacySql(false);
    }

    return getDatesToIAMRecommendationsConfiguration;
  }

  /**
   * Retrieves query job configuration that inserts {@code values} into the 
   * IAM Bindings table.
   * @param values The values to be inserted. Must be formatted as 
      {@code "(column1Value1, column2Value1, column3Value1, ....), 
      (column1Value2, column2Value2, column3Value2, ....), ..."}, with each row 
      to be inserted having a value for every column in the specified table, and 
      with no comma at the end of the list of rows. 
   */
  public QueryJobConfiguration.Builder insertValuesIAMTableConfiguration(String values) {
    if (insertValuesIAMTableConfiguration == null) {
      insertValuesIAMTableConfiguration = Queries.INSERT_VALUES_INTO_IAM_TABLE;
    }

    return QueryJobConfiguration
      .newBuilder(insertValuesIAMTableConfiguration + values).setUseLegacySql(false);
  }

  /**
   * Retrieves query job configuration that inserts {@code values} into the 
   * Recommendations table. 
   * @param values The values to be inserted. Must be formatted as 
      {@code "(column1Value1, column2Value1, column3Value1, ....), 
      (column1Value2, column2Value2, column3Value2, ....), ..."}, with each row 
      to be inserted having a value for every column in the specified table, and 
      with no comma at the end of the list of rows. 
   */
  public QueryJobConfiguration.Builder 
    insertValuesRecommendationsTableConfiguration(String values) {
    if (insertValuesRecommendationsTableConfiguration == null) {
      insertValuesRecommendationsTableConfiguration = 
        Queries.INSERT_VALUES_INTO_RECOMMENDATIONS_TABLE;
    }

    return QueryJobConfiguration
      .newBuilder(insertValuesRecommendationsTableConfiguration + values)
      .setUseLegacySql(false);
  }
  
  /** 
   * Retrieves query job configuration that deletes 365-day-old data from the 
   * IAM bindings table.
   */
  public QueryJobConfiguration.Builder deleteOldDataIAMTableConfiguration() {
    if (deleteOldDataIAMTableConfiguration == null) {
      deleteOldDataIAMTableConfiguration = QueryJobConfiguration
      .newBuilder(Queries.DELETE_OLD_DATA_FROM_IAM_TABLE).setUseLegacySql(false);
    }

    return deleteOldDataIAMTableConfiguration;
  }

  /**
   * Retrieves query job configuration that deletes 365-day-old data from the 
   * Recommendations table.
   */
  public QueryJobConfiguration.Builder deleteOldDataRecommendationsTableConfiguration() {
    if (deleteOldDataRecommendationsTableConfiguration == null) {
      deleteOldDataRecommendationsTableConfiguration = QueryJobConfiguration
      .newBuilder(Queries.DELETE_OLD_DATA_FROM_RECOMMENDATIONS_TABLE).setUseLegacySql(false);
    }

    return deleteOldDataRecommendationsTableConfiguration;
  }
}
