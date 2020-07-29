package com.google.impactdashboard.database_manager.bigquery;

import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.recommendation.*;
import java.util.List;
/** 
 * An interface for building query configuration builder objects and storing them, 
 * so that they only need to be built once. 
 */
public interface QueryConfigurationBuilder {
  /** 
   * Retrieves query job configuration that retrieves all project ids from the 
   * database. 
   */
  public QueryJobConfiguration.Builder getProjectIdsConfiguration();

  /** 
   * Retrieves query job configuration that retrieves all organization ids from 
   * the database. 
   */
  public QueryJobConfiguration.Builder getOrganizationIdsConfiguration();

  /** 
   * Retrieves parameterized query job configuration that retrieves the 
   * identifying information for a single project from the database.
   */
  public QueryJobConfiguration.Builder getProjectIdentificationInformationConfiguration();

  /**
   * Retrieves parameterized query job configuration that retrieves the name
   * of a single organization. 
   */
  public QueryJobConfiguration.Builder getOrganizationNameConfiguration();

  /** 
   * Retrieves parameterized query job configuration that retrieves the 
   * average number of bindings for a single project for every entry in the table. 
   */
  public QueryJobConfiguration.Builder getAverageBindingsConfiguration();

  /**
   * Retrieves parameterized query job configuration that retrieves the average
   * number of bindings summed across all projects belonging to a single 
   * organization. 
   */
  public QueryJobConfiguration.Builder getAverageOrganizationBindingsConfiguration();

  /**
   * Retrieves parameterized query job configuration that retrieves all 
   * (timestamp, number of bindings) data in tetheh table for a single project. 
   */
  public QueryJobConfiguration.Builder getDatesToBindingsConfiguration();

  /**
   * Retrieves parameterized query job configuration that retrieves all 
   * (timestamp, recomendation) data in the table for a single project, from the 
   * IAM Bindings Recommender.
   */
  public QueryJobConfiguration.Builder getDatesToIAMRecommendationsConfiguration();

  /**
   * Retrieves query job configuration that inserts {@code values} into the 
   * IAM Bindings table.
   */
  public QueryJobConfiguration.Builder 
    insertValuesIAMTableConfiguration(List<IAMBindingDatabaseEntry> values);
  /**
   * Retrieves query job configuration that inserts {@code values} into the 
   * Recommendations table. 
   */
  public QueryJobConfiguration.Builder 
    insertValuesRecommendationsTableConfiguration(List<Recommendation> values);  
  /** 
   * Retrieves query job configuration that deletes 365-day-old data from the 
   * IAM bindings table.
   */
  public QueryJobConfiguration.Builder deleteOldDataIAMTableConfiguration();

  /**
   * Retrieves query job configuration that deletes 365-day-old data from the 
   * Recommendations table.
   */
  public QueryJobConfiguration.Builder deleteOldDataRecommendationsTableConfiguration();

  /**
   * Retrieves query job configuration that gets the most recent timestamp from 
   * the IAM Bindings Table.
   */
  public QueryJobConfiguration.Builder getMostRecentTimestampConfiguration();
}
