package com.google.impactdashboard.server;

import com.google.common.annotations.VisibleForTesting;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManager;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManagerFactory;
import com.google.impactdashboard.server.api_utilities.LogRetriever;
import com.google.impactdashboard.server.api_utilities.RecommendationRetriever;

import java.io.IOException;
import java.util.List;

/** Class for updating the information in the database from the API. */
public class DataUpdater {

  private final LogRetriever logRetriever;
  private final RecommendationRetriever recommendationRetriever;
  private final DataUpdateManager updateManager;

  @VisibleForTesting
  protected DataUpdater(LogRetriever logRetriever, RecommendationRetriever recommendationRetriever,
                      DataUpdateManager updateManager) {
    this.logRetriever = logRetriever;
    this.recommendationRetriever = recommendationRetriever;
    this.updateManager = updateManager;
  }

  /**
   * Static factory for creating a new instance of DataUpdater with new instances of LogRetriever
   * and RecommendationRetriever.
   * @return New instance of DataUpdater
   */
  public static DataUpdater create() throws IOException {
    return new DataUpdater(LogRetriever.create(), RecommendationRetriever.create(),
        DataUpdateManagerFactory.create());
  }

  /**
   * Updates the database with any new information about recommendations and IAMBinding logging.
   */
  public void updateDatabase() {
    updateManager.deleteYearOldData();
    updateManager.updateRecommendations(listUpdatedRecommendations());
    updateManager.updateIAMBindings(listUpdatedIAMBindingData());
  }

  /**
   * Gets the new Recommendation data from the Recommender API
   * @return a List of Recommendations
   */
  private List<Recommendation> listUpdatedRecommendations() {
    // Steps for implementing this function (may require more methods for single responsibility)
    // retrieve recommendations from cloud logging and recommender
    // retrieve current recommendations stored by database
    // filter out any duplicate recommendations
    // add non duplicate recommendation to the database
    throw new UnsupportedOperationException("Not Implemented");
  }

  /**
   * Lists the new IAM Binding data from the cloud logging API
   * @return A List of IAMBindingDatabaseEntry
   */
  private List<IAMBindingDatabaseEntry> listUpdatedIAMBindingData() {
    // Steps for implementing this function (may require more methods for single responsibility)
    // retrieve IAMBinding information from cloud logging and IAM API
    // retrieve IAMBinding from database
    // (TODO determine whether to retrieve all info or info for a certain time range)
    // filter out any duplicate IAM Information
    // add non duplicates to database
    throw new UnsupportedOperationException("Not Implemented");
  }

}
