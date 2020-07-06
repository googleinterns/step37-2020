package com.google.impactdashboard.database_manager.data_update;

import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import java.util.List;

/** Class for managing updates to the database. */
public class DataUpdateManagerImpl implements DataUpdateManager {
  /** 
   *  Deletes data from both the Recommendations and IAM Bindings tables if that 
   *  data is over 365 days old.  
   */
  @Override
  public void deleteYearOldData() {
  }

  /** 
   * Stores inputted recommendations in the Recommendations table 
   * @param recommendations A list of recommendations to be added to the database.
   */
  @Override
  public void updateRecommendations(List<Recommendation> recommendations) {
  }

  /** 
   * Stores inputted IAM bindings information in the IAM Bindings table.
   * @param iamBindingsData A list of Bindings table entries to be added to the database. 
   */
  @Override
  public void updateIAMBindings(List<IAMBindingDatabaseEntry> iamBindingsData) {
  }
}