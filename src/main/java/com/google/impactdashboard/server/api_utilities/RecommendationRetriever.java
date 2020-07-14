package com.google.impactdashboard.server.api_utilities;

import com.google.cloud.recommender.v1.Recommendation;
import com.google.cloud.recommender.v1.RecommenderClient;
import java.io.IOException;
import java.util.Collection;

/** Class that calls the Recommender API to get the full information for recommendations. */
public class RecommendationRetriever {

  private RecommenderClient recommender;

  private RecommendationRetriever(RecommenderClient recommender) {
    this.recommender = recommender;
  }

  /**
   * Static factory method for creating a RecommendationRetriever with a new
   * RecommenderClient.
   * @return A new instance of a {@code RecommendationRetriever}
   */
  public static RecommendationRetriever create() throws IOException {
    return new RecommendationRetriever(RecommenderClient.create());
  }
  /**
   * Helper method to be called to retrieve all recommendations in the last 90 days
   * from recommender for a certain project.
   * @return collection of recommendations for the project specified
   */
  public Collection<Recommendation> listRecommendations(String projectId) {
   throw new UnsupportedOperationException("Not implemented");
  }
}
