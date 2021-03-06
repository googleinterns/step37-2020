package com.google.impactdashboard.server.api_utilities;

import com.google.cloud.recommender.v1.RecommenderClient;
import com.google.cloud.recommender.v1.RecommenderSettings;
import com.google.cloud.recommender.v1.stub.RecommenderStubSettings;
import com.google.impactdashboard.Credentials;
import com.google.impactdashboard.data.recommendation.IAMRecommenderMetadata;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.data.recommendation.RecommendationAction;
import com.google.logging.v2.LogEntry;
import com.google.protobuf.Value;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/** Class that calls the Recommender API to get the full information for recommendations. */
public class RecommendationRetriever {

  private RecommenderClient recommender;
  private ResourceRetriever resourceRetriever;

  private RecommendationRetriever(RecommenderClient recommender, ResourceRetriever resourceRetriever) {
    this.recommender = recommender;
    this.resourceRetriever = resourceRetriever;
  }

  /**
   * Static factory method for creating a RecommendationRetriever with a new
   * RecommenderClient.
   * @return A new instance of a {@code RecommendationRetriever}
   */
  public static RecommendationRetriever create() throws IOException {
    RecommenderStubSettings stub = RecommenderStubSettings.newBuilder()
        .setCredentialsProvider(Credentials::getCredentials).build();
    return new RecommendationRetriever(RecommenderClient.create(RecommenderSettings.create(stub)),
        ResourceRetriever.getInstance());
  }

  /**
   * Helper method to be called to retrieve all recommendations in the last 90 days
   * from recommender for a certain project.
   * @return collection of recommendations for the project specified
   */
  public List<Recommendation> listRecommendations(Collection<LogEntry> recommendationLogs,
                                String projectId, Recommendation.RecommenderType type,
                                IamBindingRetriever iamRetriever) {
    return recommendationLogs.stream().map(recommendationLog -> {
      Map<String, Value> recommendationDataMap = recommendationLog.getJsonPayload().getFieldsMap();
      com.google.cloud.recommender.v1.Recommendation recommendation = recommender
          .getRecommendation(recommendationDataMap.get("recommendationName").getStringValue());
      List<RecommendationAction> actions = getRecommendationActions(recommendation);
      return Recommendation.create(projectId, resourceRetriever.getOrganizationId(projectId), recommendationDataMap.get("actor").getStringValue(),
          actions, type, recommendationLog.getTimestamp().getSeconds() * 1000,
          IAMRecommenderMetadata.create(iamRetriever.getActionImpact(actions)));
    }).collect(Collectors.toList());
  }

  /**
   * Takes the information in a recommendation and compiles it into an Action list.
   * @param recommendation the recommendation the description is coming from
   * @return The a list of actions for the given recommendation
   */
  private List<RecommendationAction> getRecommendationActions(
      com.google.cloud.recommender.v1.Recommendation recommendation) {
    RecommendationAction.ActionType type;
    if(recommendation.getRecommenderSubtype().equals("REMOVE_ROLE")) {
      type = RecommendationAction.ActionType.REMOVE_ROLE;
    } else {
      type = RecommendationAction.ActionType.REPLACE_ROLE;
    }
    List<RecommendationAction> actions = recommendation.getContent().getOperationGroupsList()
        .stream().map(operationGroup -> {
          Set<String> affectedAccount = new HashSet<>();
          Set<String> previousRole = new HashSet<>();
          Set<String> newRole = new HashSet<>();
          operationGroup.getOperationsList().forEach(operation -> {
            if(operation.getAction().equals("add")) {
              newRole.add(operation.getPathFiltersMap().get("/iamPolicy/bindings/*/role")
                  .getStringValue());
            } else if(operation.getAction().equals("remove")) {
              previousRole.add(operation.getPathFiltersMap().get("/iamPolicy/bindings/*/role")
                  .getStringValue());
              affectedAccount.add(operation.getPathFiltersMap()
                  .get("/iamPolicy/bindings/*/members/*").getStringValue());
            }
          });
          return RecommendationAction.create(String.join(", ", affectedAccount),
              String.join(", ", previousRole), String.join(", ", newRole), type);
        }).collect(Collectors.toList());
    return actions;
  }
}
