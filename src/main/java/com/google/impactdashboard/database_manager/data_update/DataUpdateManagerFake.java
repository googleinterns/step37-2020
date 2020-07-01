package com.google.impactdashboard.database_manager.data_update;

import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.database_manager.FakeDatabase;
import java.util.List;

/** Class for faking out a DataUpdateManager object. */
public class DataUpdateManagerFake implements DataUpdateManager {
  /** 
   *  Deletes data from both the Recommendations and IAM Bindings tables if that 
   *  data is over 365 days old.  
   */
  @Override
  public void deleteYearOldData() {
    FakeDatabase.deleteYearOldData();
  }

  /** Stores inputted recommendations in the Recommendations table */
  @Override
  public void updateRecommendations(List<Recommendation> recommendations) {
    FakeDatabase.addRecommendations(recommendations);
  }

  /** Stores inputted IAM bindings information in the IAM Bindings table. */
  @Override
  public void updateIAMBindings(List<IAMBindingDatabaseEntry> iamBindingsData) {
    FakeDatabase.addIAMBindingsData(iamBindingsData);
  }
}
