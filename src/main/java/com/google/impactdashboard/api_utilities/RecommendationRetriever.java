package com.google.impactdashboard.api_utilities;

import com.google.cloud.recommender.v1.Recommendation;
import com.google.cloud.recommender.v1.RecommenderClient;
import java.io.IOException;
import java.util.Collection;

/**
 * Class that will call the Recommender API to get the full information for recommendations
 */
public class RecommendationRetriever {

  private RecommenderClient recommender;

  public RecommendationRetriever() throws IOException {
    recommender = RecommenderClient.create();
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
