package com.google.impactdashboard.server.api_utilities;

import com.google.cloud.recommender.v1.RecommenderClient;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.logging.v2.LogEntry;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

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
  public List<Recommendation> listRecommendations(List<LogEntry> recommendationLogs,
                                                  String projectId, long acceptedTimestamp) {
    throw new UnsupportedOperationException("Not Implemented");
  }

  private com.google.cloud.recommender.v1.Recommendation getRecommendation() {
    throw new UnsupportedOperationException("Not Implmented");
  }
}
