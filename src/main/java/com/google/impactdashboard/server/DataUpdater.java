package com.google.impactdashboard.server;

import com.google.impactdashboard.api_utilities.LogRetriever;
import com.google.impactdashboard.api_utilities.RecommendationRetriever;

import java.io.IOException;

/** Class for updating the information in the database from the API */
public class DataUpdater {

  private LogRetriever logRetriever;
  private RecommendationRetriever recommendationRetriever;

  private DataUpdater(LogRetriever logRetriever, RecommendationRetriever recommendationRetriever) {
    this.logRetriever = logRetriever;
    this.recommendationRetriever = recommendationRetriever;
  }

  /**
   * Static factory for creating a new instance of DataUpdater with new instances of LogRetriever
   * and RecommendationRetriever.
   * @return New instance of DataUpdater
   */
  public DataUpdater create() throws IOException {
    return new DataUpdater(LogRetriever.create(), RecommendationRetriever.create());
  }

  
}
