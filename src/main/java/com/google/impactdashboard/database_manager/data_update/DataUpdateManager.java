package com.google.impactdashboard.database_manager.data_update;

import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import java.util.List;

/** Interface for managing updates to the database. */
public interface DataUpdateManager {
  /** 
   *  Deletes data from both the Recommendations and IAM Bindings tables if that 
   *  data is over 365 days old.  
   */
  public void deleteYearOldData();

  /** 
   * Stores inputted recommendations in the Recommendations table 
   * @param recommendations A list of recommendations to be added to the database. 
   */
  public void updateRecommendations(List<Recommendation> recommendations);

  /** 
   * Stores inputted IAM bindings information in the IAM Bindings table.
   * @param iamBindingsData A list of Bindings table entries to be added to the database. 
   */
  public void updateIAMBindings(List<IAMBindingDatabaseEntry> iamBindingsData);
}
