package com.google.impactdashboard.database_manager.data_update;

import com.google.impactdashboard.data.recommendation.*;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.database_manager.bigquery.*;
import java.util.List;
import java.io.IOException;
import com.google.cloud.bigquery.QueryJobConfiguration;

/** Class for managing updates to the database. */
public class DataUpdateManagerImpl implements DataUpdateManager {
  DatabaseAccessor database;
  QueryConfigurationBuilder queryConfigurationBuilder;

  public DataUpdateManagerImpl() throws IOException {
    database = new DatabaseAccessor(); 
    queryConfigurationBuilder = QueryConfigurationBuilderFactory.create();
  }

  /** 
   *  Deletes data from both the Recommendations and IAM Bindings tables if that 
   *  data is over 365 days old.  
   */
  @Override
  public void deleteYearOldData() {
    deleteYearOldDataFromIAMTable();
    deleteYearOldDataFromRecommendationsTable();
  }

  /** 
   * Stores inputted recommendations in the Recommendations table 
   * @param recommendations A list of recommendations to be added to the database.
   */
  @Override
  public void updateRecommendations(List<Recommendation> recommendations) {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .insertValuesRecommendationsTableConfiguration(recommendations).build();
    database.updateDatabase(queryConfiguration);
  }

  /** 
   * Stores inputted IAM bindings information in the IAM Bindings table.
   * @param iamBindingsData A list of Bindings table entries to be added to the database. 
   */
  @Override
  public void updateIAMBindings(List<IAMBindingDatabaseEntry> iamBindingsData) {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .insertValuesIAMTableConfiguration(iamBindingsData).build();
    database.updateDatabase(queryConfiguration);
  }

  /**
   * Deletes data from the IAM Bindings table that is over 365 days old. More 
   * specifically, deletes data that is more than 365 older than the newest entry 
   * in the table, since the tables should hold at most a window of 365 days 
   * of information.
   */
  private void deleteYearOldDataFromIAMTable() {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .deleteOldDataIAMTableConfiguration().build();
    database.updateDatabase(queryConfiguration); 
  }

  /**
   * Deletes data from the Recommendations table that is over 365 days old. More 
   * specifically, deletes data that is more than 365 older than the newest entry 
   * in the IAM table, since the tables should hold at most a window of 365 days 
   * of information.
   */
  private void deleteYearOldDataFromRecommendationsTable() {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .deleteOldDataRecommendationsTableConfiguration().build();
    database.updateDatabase(queryConfiguration); 
  }
}
