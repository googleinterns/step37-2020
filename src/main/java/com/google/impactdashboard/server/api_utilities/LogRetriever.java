package com.google.impactdashboard.server.api_utilities;

import com.google.cloud.logging.v2.LoggingClient;
import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
import com.google.cloud.logging.v2.LoggingSettings;
import com.google.cloud.logging.v2.stub.LoggingServiceV2StubSettings;
import com.google.impactdashboard.Credentials;
import com.google.logging.v2.ListLogEntriesRequest;
import com.google.logging.v2.LogEntry;

import java.io.IOException;
import java.util.Collection;
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
        .setCredentialsProvider(Credentials::getCredentials)
        .build();
    return new LogRetriever(LoggingClient.create(LoggingSettings.create(stub)));
  }

  private LogRetriever(LoggingClient logger) {
    this.logger = logger;
  }

  /**
   * Creates a {@code ListLogEntriesRequest} and retrieves all the relevant audit logs.
   * @param projectId ID of the project that the audit logs will be retrieved for.
   * @param timeTo Latest time to retrieve logs for.
   * @return A list of all the relevant audit log entries that are stored by the logging API
   */
  public Collection<LogEntry> listAuditLogs(String projectId, String timeTo) {
    String project_id = "projects/" + projectId;
    String filter = "resource.type = project AND severity = NOTICE AND " +
        "protoPayload.methodName:SetIamPolicy";

    ListLogEntriesRequest.Builder builder = ListLogEntriesRequest.newBuilder()
        .setOrderBy("timestamp desc").addResourceNames(project_id);

    if(!timeTo.equals("")) {
      builder.setPageSize(1);
      filter += " AND timestamp > " + timeTo;
    }

    ListLogEntriesRequest request = builder.setFilter(filter).build();
    ListLogEntriesPagedResponse response = logger.listLogEntries(request);
    return StreamSupport.stream(response.iterateAll().spliterator(), false)
        .collect(Collectors.toList());
  }

  /**
   * Creates a {@code ListLogEntriesRequest} and retrieves all the relevant Recommendation logs.
   * @param projectId ID of the project that the recommendation logs will be retrieved for.
   * @param timeTo Latest time to retrieve logs for.
   * @return A list of all the relevant recommendation log entries that are stored by the logging API.
   */
  public Collection<LogEntry> listRecommendationLogs(String projectId, String timeTo) {
    String project_id = "projects/" + projectId;
    // May need tweaking once tested
    String filter = "resource.type = recommender";
    ListLogEntriesRequest request = ListLogEntriesRequest.newBuilder().setFilter(filter)
        .setOrderBy("timestamp desc").addResourceNames(project_id).build();
    ListLogEntriesPagedResponse response = logger.listLogEntries(request);
    return StreamSupport.stream(response.iterateAll().spliterator(), false)
        .collect(Collectors.toList());
  }
}
