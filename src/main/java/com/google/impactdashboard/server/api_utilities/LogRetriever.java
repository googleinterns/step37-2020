package com.google.impactdashboard.server.api_utilities;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.logging.v2.LoggingClient;
import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
import com.google.cloud.logging.v2.LoggingSettings;
import com.google.cloud.logging.v2.stub.LoggingServiceV2StubSettings;
import com.google.impactdashboard.configuration.Constants;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.logging.v2.ListLogEntriesRequest;
import com.google.logging.v2.LogEntry;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


/** Class that handles all the retrieval of logs stored on the cloud logging API. */
public class LogRetriever {

  /** Cloud Logging client used to retrieve Audit logs and Recommendation logs */
  private LoggingClient logger;

  /**
   * Static factory method for creating a new LogRetriever with a new instance of Logging client.
   * @return A new instance of {@code LogRetriever}
   */
  public static LogRetriever create() throws IOException{
    LoggingServiceV2StubSettings stub = LoggingServiceV2StubSettings.newBuilder()
        .setCredentialsProvider(() -> {
          GoogleCredentials credentials;
          try {
            credentials = GoogleCredentials
                .fromStream(new FileInputStream(Constants.PATH_TO_SERVICE_ACCOUNT_KEY));
          } catch (IOException e) {
            credentials = GoogleCredentials
                .fromStream(new ByteArrayInputStream(System.getenv("SERVICE_ACCOUNT_KEY").getBytes()));
          }
        return credentials;
        })
        .build();
    return new LogRetriever(LoggingClient.create(LoggingSettings.create(stub)));
  }

  private LogRetriever(LoggingClient logger) {
    this.logger = logger;
  }

  /**
   * Creates a {@code ListLogEntriesRequest} and retrieves all the relevant audit logs.
   * @param projectId ID of the project that the audit logs will be retrieved for.
   * @param timeTO Latest time to retrieve logs for.
   * @return A list of all the relevant audit log entries that are stored by the logging API
   */
  public Collection<LogEntry> listAuditLogs(String projectId, long timeTO) {
    String project_id = "projects/" + projectId;
    String filter = "resource.type = project AND severity = NOTICE AND " +
        "protoPayload.methodName:SetIamPolicy";
    ListLogEntriesRequest request = ListLogEntriesRequest.newBuilder().setFilter(filter)
        .setOrderBy("timestamp desc").addResourceNames(project_id).build();
    ListLogEntriesPagedResponse response = logger.listLogEntries(request);
    return StreamSupport.stream(response.iterateAll().spliterator(), false)
        .collect(Collectors.toList());
  }

  /**
   * Creates a {@code ListLogEntriesRequest} and retrieves all the relevant Recommendation logs.
   * @param projectId ID of the project that the recommendation logs will be retrieved for.
   * @return A list of all the relevant recommendation log entries that are stored by the logging API.
   */
  public Collection<LogEntry> listRecommendationLogs(String projectId) {
    String project_id = "projects/" + projectId;
    // May need tweaking once tested
    String filter = "resource.type = recommender";
    ListLogEntriesRequest request = ListLogEntriesRequest.newBuilder().setFilter(filter)
        .setOrderBy("timestamp desc").addResourceNames(project_id).build();
    ListLogEntriesPagedResponse response = logger.listLogEntries(request);
    return StreamSupport.stream(response.iterateAll().spliterator(), false)
        .collect(Collectors.toList());
  }

  public static void main(String[] args) throws IOException {
    LogRetriever retriever = LogRetriever.create();
    RecommendationRetriever recommendationRetriever = RecommendationRetriever.create();
    Collection<LogEntry> recommendationLogs = retriever.listRecommendationLogs("concord-interns");

    List<String> recommendation = recommendationLogs.stream().map(recommendationLog ->
        recommendationLog.getJsonPayload().getFieldsMap().get("recommendationName")
            .getStringValue()).collect(Collectors.toList());

//    List<Recommendation> recommendations = recommendationRetriever.listRecommendations(recommendation,
//        "concord-interns", );
  }
}
