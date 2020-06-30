package com.google.impactdashboard.database_manager.data_update;

import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import java.util.List;
import java.lang.UnsupportedOperationException;

/** Class for faking out a DataUpdateManager object. */
public class DataUpdateManagerFake implements DataUpdateManager {
  /** 
   *  Deletes data from both the Recommendations and IAM Bindings tables if that 
   *  data is over 365 days old.  
   */
  @Override
  public void deleteYearOldData() {
    throw new UnsupportedOperationException("Unimplemented");
  }

  /** Stores inputted recommendations in the Recommendations table */
  @Override
  public void updateRecommendations(List<Recommendation> recommendations) {
    throw new UnsupportedOperationException("Unimplemented");
  }

  /** Stores inputted IAM bindings information in the IAM Bindings table. */
  @Override
  public void updateIAMBindings(List<IAMBindingDatabaseEntry> iamBindingsData) {
    throw new UnsupportedOperationException("Unimplemented");
  }
}
