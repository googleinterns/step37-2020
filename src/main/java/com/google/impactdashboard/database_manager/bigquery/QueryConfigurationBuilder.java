package com.google.impactdashboard.database_manager.bigquery;

import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.recommendation.*;
import java.util.List;
import java.util.stream.Collectors;
/** 
 * A class for building query configuration builder objects and storing them, 
 * so that they only need to be built once. 
 */
public class QueryConfigurationBuilder {

  private QueryJobConfiguration.Builder getProjectIdsConfiguration;
  private QueryJobConfiguration.Builder getOrganizationIdsConfiguration;
  private QueryJobConfiguration.Builder getProjectIdentificationInformationConfiguration;
  private QueryJobConfiguration.Builder getOrganizationNameConfiguration;
  private QueryJobConfiguration.Builder getAverageBindingsConfiguration;
  private QueryJobConfiguration.Builder getAverageOrganizationBindingsConfiguration;
  private QueryJobConfiguration.Builder getDatesToBindingsConfiguration;
  private QueryJobConfiguration.Builder getOrganizationDatesToBindingsConfiguration;
  private QueryJobConfiguration.Builder getDatesToIAMRecommendationsConfiguration;
  private QueryJobConfiguration.Builder getOrganizationDatesToRecommendationsConfiguration;
  private String insertValuesIAMTableConfiguration;
  private String insertValuesRecommendationsTableConfiguration;
  private QueryJobConfiguration.Builder deleteOldDataIAMTableConfiguration;
  private QueryJobConfiguration.Builder deleteOldDataRecommendationsTableConfiguration;
  private QueryJobConfiguration.Builder getMostRecentTimestampConfiguration;

  protected QueryConfigurationBuilder(
    QueryJobConfiguration.Builder getProjectIdsConfiguration, 
    QueryJobConfiguration.Builder getOrganizationIdsConfiguration, 
    QueryJobConfiguration.Builder getProjectIdentificationInformationConfiguration, 
    QueryJobConfiguration.Builder getOrganizationNameConfiguration, 
    QueryJobConfiguration.Builder getAverageBindingsConfiguration, 
    QueryJobConfiguration.Builder getAverageOrganizationBindingsConfiguration, 
    QueryJobConfiguration.Builder getDatesToBindingsConfiguration, 
    QueryJobConfiguration.Builder getOrganizationDatesToBindingsConfiguration, 
    QueryJobConfiguration.Builder getDatesToIAMRecommendationsConfiguration, 
    QueryJobConfiguration.Builder getOrganizationDatesToRecommendationsConfiguration, 
    String insertValuesIAMTableConfiguration, 
    String insertValuesRecommendationsTableConfiguration, 
    QueryJobConfiguration.Builder deleteOldDataIAMTableConfiguration, 
    QueryJobConfiguration.Builder deleteOldDataRecommendationsTableConfiguration, 
    QueryJobConfiguration.Builder getMostRecentTimestampConfiguration) {

    this.getProjectIdsConfiguration = getProjectIdsConfiguration;
    this.getOrganizationIdsConfiguration = getOrganizationIdsConfiguration;
    this.getProjectIdentificationInformationConfiguration = 
      getProjectIdentificationInformationConfiguration;
    this.getOrganizationNameConfiguration = getOrganizationNameConfiguration;
    this.getAverageBindingsConfiguration = getAverageBindingsConfiguration;
    this.getAverageOrganizationBindingsConfiguration = getAverageOrganizationBindingsConfiguration;
    this.getDatesToBindingsConfiguration = getDatesToBindingsConfiguration;
    this.getOrganizationDatesToBindingsConfiguration = getOrganizationDatesToBindingsConfiguration;
    this.getDatesToIAMRecommendationsConfiguration = getDatesToIAMRecommendationsConfiguration;
    this.getOrganizationDatesToRecommendationsConfiguration = 
      getOrganizationDatesToRecommendationsConfiguration;
    this.insertValuesIAMTableConfiguration = insertValuesIAMTableConfiguration;
    this.insertValuesRecommendationsTableConfiguration = 
      insertValuesRecommendationsTableConfiguration;
    this.deleteOldDataIAMTableConfiguration = deleteOldDataIAMTableConfiguration;
    this.deleteOldDataRecommendationsTableConfiguration = 
      deleteOldDataRecommendationsTableConfiguration;
    this.getMostRecentTimestampConfiguration = getMostRecentTimestampConfiguration;
  }

  /** 
   * Retrieves query job configuration that retrieves all project ids from the 
   * database. 
   */
  public QueryJobConfiguration.Builder getProjectIdsConfiguration() {
    return getProjectIdsConfiguration;
  }

  /** 
   * Retrieves query job configuration that retrieves all organization ids from 
   * the database. 
   */
  public QueryJobConfiguration.Builder getOrganizationIdsConfiguration() {
    return getOrganizationIdsConfiguration;
  }

  /** 
   * Retrieves parameterized query job configuration that retrieves the 
   * identifying information for a single project from the database.
   */
  public QueryJobConfiguration.Builder getProjectIdentificationInformationConfiguration() {
    return getProjectIdentificationInformationConfiguration;
  }

  /**
   * Retrieves parameterized query job configuration that retrieves the name
   * of a single organization. 
   */
  public QueryJobConfiguration.Builder getOrganizationNameConfiguration() {
    return getOrganizationNameConfiguration;
  }

  /** 
   * Retrieves parameterized query job configuration that retrieves the 
   * average number of bindings for a single project for every entry in the table. 
   */
  public QueryJobConfiguration.Builder getAverageBindingsConfiguration() {
    return getAverageBindingsConfiguration;
  }

  /**
   * Retrieves parameterized query job configuration that retrieves the average
   * number of bindings summed across all projects belonging to a single 
   * organization. 
   */
  public QueryJobConfiguration.Builder getAverageOrganizationBindingsConfiguration() {
    return getAverageOrganizationBindingsConfiguration;
  }

  /**
   * Retrieves parameterized query job configuration that retrieves all 
   * (timestamp, number of bindings) data in tetheh table for a single project. 
   */
  public QueryJobConfiguration.Builder getDatesToBindingsConfiguration() {
    return getDatesToBindingsConfiguration;
  }

  /**
   * Retrieves parameterized query job configuration that retrieves all 
   * (timestamp, total bindings) data in the IAM table such that 'total bindings'
   * is the sum of bindings across all projects belonging to a particular
   * organization on 'timestamp'.
   */
  public QueryJobConfiguration.Builder getOrganizationDatesToBindingsConfiguration() {
    return getOrganizationDatesToBindingsConfiguration;
  }

  /**
   * Retrieves parameterized query job configuration that retrieves all 
   * (timestamp, recomendation) data in the table for a single project, from the 
   * IAM Bindings Recommender.
   */
  public QueryJobConfiguration.Builder getDatesToIAMRecommendationsConfiguration() {
    return getDatesToIAMRecommendationsConfiguration;
  }

  /**
   * Retrieves parameterized query job configuration that retrieves all 
   * (timestamp, recommendation) data in the table where the project that
   * the recommendation was accepted on belongs to a particular organization.
   */
  public QueryJobConfiguration.Builder getOrganizationDatesToRecommendationsConfiguration() {
    return getOrganizationDatesToRecommendationsConfiguration;
  }

  /**
   * Retrieves query job configuration that inserts {@code values} into the 
   * IAM Bindings table.
   * @param values The data to be inserted. 
   */
  public QueryJobConfiguration.Builder 
    insertValuesIAMTableConfiguration(List<IAMBindingDatabaseEntry> values) {
    String sqlFormattedValues = values.stream()
      .map(bindingData -> String.format(
        "('%s', '%s', '%s', '%s', '%s', " + 
        "TIMESTAMP_ADD('1970-01-01 00:00:00 UTC', INTERVAL %s SECOND), %s)", 
        bindingData.getProjectId(), bindingData.getProjectName(), 
        bindingData.getProjectNumber(), bindingData.getIdentification().getId(),
        bindingData.getIdentification().getName(), bindingData.getTimestamp() / 1000, 
        bindingData.getBindingsNumber()))
      .collect(Collectors.joining(", "));

    return QueryJobConfiguration
      .newBuilder(insertValuesIAMTableConfiguration + sqlFormattedValues).setUseLegacySql(false);
  }

  /**
   * Retrieves query job configuration that inserts {@code values} into the 
   * Recommendations table. 
   * @param values The recommendations to be inserted.
   */
  public QueryJobConfiguration.Builder 
    insertValuesRecommendationsTableConfiguration(List<Recommendation> values) {
    String sqlFormattedValues = values.stream()
      .map(recommendation -> String.format(
        "('%s', '%s', '%s', '%s', [%s], " + 
          "TIMESTAMP_ADD('1970-01-01 00:00:00 UTC', INTERVAL %s SECOND), %s)",
        recommendation.getProjectId(), recommendation.getOrganizationId(),
        recommendation.getRecommender(), recommendation.getActor(), 
        getFormattedActionsList(recommendation.getActions()), 
        recommendation.getAcceptedTimestamp() / 1000, 
        ((IAMRecommenderMetadata) recommendation.getMetadata()).getImpactInIAMBindings()))
      .collect(Collectors.joining(", "));

    return QueryJobConfiguration
      .newBuilder(insertValuesRecommendationsTableConfiguration + sqlFormattedValues)
      .setUseLegacySql(false);
  }
  
  /** 
   * Retrieves query job configuration that deletes 365-day-old data from the 
   * IAM bindings table.
   */
  public QueryJobConfiguration.Builder deleteOldDataIAMTableConfiguration() {
    return deleteOldDataIAMTableConfiguration;
  }

  /**
   * Retrieves query job configuration that deletes 365-day-old data from the 
   * Recommendations table.
   */
  public QueryJobConfiguration.Builder deleteOldDataRecommendationsTableConfiguration() {
    return deleteOldDataRecommendationsTableConfiguration;
  }

  /**
   * Retrieves query job configuration that gets the most recent timestamp from 
   * the IAM Bindings Table.
   */
  public QueryJobConfiguration.Builder getMostRecentTimestampConfiguration() {
    return getMostRecentTimestampConfiguration;
  }

  /** Returns {@code actions} formatted as a list of SQL structs. */
  private String getFormattedActionsList(List<RecommendationAction> actions) {
    return actions.stream()
      .map(action -> 
        String.format("STRUCT('%s', '%s', '%s')", 
          action.getAffectedAccount(), action.getPreviousRole(), action.getNewRole()))
      .collect(Collectors.joining(", "));
  }
}
