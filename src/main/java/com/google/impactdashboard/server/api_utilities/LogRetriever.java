package com.google.impactdashboard.server.api_utilities;

import com.google.cloud.logging.v2.LoggingClient;
import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
import com.google.cloud.logging.v2.LoggingSettings;
import com.google.cloud.logging.v2.stub.LoggingServiceV2StubSettings;
import com.google.common.base.Strings;
import com.google.impactdashboard.Credentials;
import com.google.logging.v2.ListLogEntriesRequest;
import java.io.IOException;


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
   * @param timeFrom The earliest time to retrieve logs for.
   * @param timeTo The latest time to retrieve logs for.
   * @return A response that contains all the relevant audit log entries that are stored by the logging API
   */
  public ListLogEntriesPagedResponse listAuditLogsResponse(String projectId, String timeFrom,
                                                           String timeTo, int pageSize,
                                                           String pageToken) {
    StringBuilder resourceNameStringBuilder = new StringBuilder();
    resourceNameStringBuilder.append("projects/");
    resourceNameStringBuilder.append(projectId);

    StringBuilder filterStringBuilder = new StringBuilder();
    filterStringBuilder.append("resource.type = project AND severity = NOTICE");
    filterStringBuilder.append(" AND protoPayload.methodName:SetIamPolicy");

    if (!timeFrom.equals("")) {
      filterStringBuilder.append(" AND timestamp > \"");
      filterStringBuilder.append(timeFrom);
      filterStringBuilder.append("\"");
    }
    if (!timeTo.equals("")) {
      filterStringBuilder.append(" AND timestamp < \"");
      filterStringBuilder.append(timeTo);
      filterStringBuilder.append("\"");
    }

    ListLogEntriesRequest.Builder builder = ListLogEntriesRequest.newBuilder()
        .setOrderBy("timestamp desc").addResourceNames(resourceNameStringBuilder.toString());

    if(!Strings.isNullOrEmpty(pageToken)) {
      builder.setPageToken(pageToken);
    }

    ListLogEntriesRequest request = builder.setFilter(filterStringBuilder.toString())
        .setPageSize(pageSize).build();
    return logger.listLogEntries(request);
  }

  /**
   * Creates a {@code ListLogEntriesRequest} and retrieves all the relevant Recommendation logs.
   * @param projectId ID of the project that the recommendation logs will be retrieved for.
   * @param timeFrom Earliest time to retrieve logs for
   * @param timeTo Latest time to retrieve logs for.
   * @return A list of all the relevant recommendation log entries that are stored by the logging API.
   */
  public ListLogEntriesPagedResponse listRecommendationLogs(String projectId, 
    String timeFrom, String timeTo) {
    StringBuilder resourceNameStringBuilder = new StringBuilder();
    resourceNameStringBuilder.append("projects/");
    resourceNameStringBuilder.append(projectId);

    StringBuilder filterStringBuilder = new StringBuilder();
    filterStringBuilder.append("resource.type = recommender AND ");
    filterStringBuilder.append("resource.labels.recommender_id= google.iam.policy.Recommender ");
    filterStringBuilder.append(" AND jsonPayload.state = SUCCEEDED");

    if (!timeFrom.equals("")) {
      filterStringBuilder.append(" AND timestamp > \"");
      filterStringBuilder.append(timeFrom);
      filterStringBuilder.append("\"");
    }

    if (!timeTo.equals("")) {
      filterStringBuilder.append(" AND timestamp < \"");
      filterStringBuilder.append(timeTo);
      filterStringBuilder.append("\"");
    }

    ListLogEntriesRequest request = ListLogEntriesRequest.newBuilder()
      .setFilter(filterStringBuilder.toString()).setOrderBy("timestamp desc")
      .addResourceNames(resourceNameStringBuilder.toString()).build();

    return logger.listLogEntries(request);
  }
}
