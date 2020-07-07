package com.google.impactdashboard.database_manager.bigquery;

import java.lang.UnsupportedOperationException;
import com.google.cloud.bigquery.QueryJobConfiguration;

/** 
 * An interface for building query configuration builder object and storing them, 
 * so that they only need ot be built once. 
 */
public interface QueryConfigurationBuilder {

  /** Returns the only instance of the class. */
  public static QueryConfigurationBuilder getInstance() {
    throw new UnsupportedOperationException("Must be overriden");
  }

  /** 
   * Retrieves query job configuration that retrieves all project ids from the 
   * database. 
   */
  public QueryJobConfiguration.Builder getProjectIdsConfiguration();

  /** 
   * Retrieves parameterized query job configuration that retrieves the 
   * identifying information for a single project from the database.
   */
  public QueryJobConfiguration.Builder getProjectIdentificationInformationConfiguration();

  /** 
   * Retrieves parameterized query job configuration that retrieves the 
   * average number of bindings for a single project for every entry in the table. 
   */
  public QueryJobConfiguration.Builder getAverageBindingsConfiguration();

  /**
   * Retrieves parameterized query job configuration that retrieves all 
   * (timestamp, number of bindings) data in tetheh table for a single project. 
   */
  public QueryJobConfiguration.Builder getDatesToBindingsConfiguration();

  /**
   * Retrieves parameterized query job configuration that retrieves all (timestamp, recomendation) data in the table for a single project, from the IAM Bindings Recommender.
   */
  public QueryJobConfiguration.Builder getDatesToIAMRecommendationsConfiguration();

  /**
   * Retrieves query job configuration that inserts {@code values} into the 
   * IAM Bindings table.
   * @param values The values to be inserted. Must be formatted as 
      {@code "(column1Value1, column2Value1, column3Value1, ....), 
      (column1Value2, column2Value2, column3Value2, ....), ..."}, with each row 
      to be inserted having a value for every column in the specified table, and 
      with no comma at the end of the list of rows. 
   */
  public QueryJobConfiguration.Builder insertValuesIntoIAMTableConfiguration(String values);

  
}