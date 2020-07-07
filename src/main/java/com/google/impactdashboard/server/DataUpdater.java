package com.google.impactdashboard.server;

import com.google.common.annotations.VisibleForTesting;
import com.google.impactdashboard.api_utilities.LogRetriever;
import com.google.impactdashboard.api_utilities.RecommendationRetriever;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManager;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManagerFactory;

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
  public void updateDatabase() {}

  /**
   * Gets the new Recommendation data from the Recommender API.
   * @return a List of Recommendations
   */
  private List<Recommendation> getUpdatedRecommendations() {
    throw new UnsupportedOperationException("Not Implemented");
  }

}
