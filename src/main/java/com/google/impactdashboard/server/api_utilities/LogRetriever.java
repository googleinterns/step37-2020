package com.google.impactdashboard.server.api_utilities;

import com.google.cloud.logging.v2.LoggingClient;
import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
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
    return new LogRetriever(LoggingClient.create());
  }

  private LogRetriever(LoggingClient logger) {
    this.logger = logger;
  }

  /**
   * Function used to create a {@code ListLogEntriesRequest} and retrieve all the relevant audit logs
   * @return A list of all the relevant audit log entries that are stored by the logging API
   */
  public Collection<LogEntry> listAuditLogs() {
    String project_id = "projects/concord-intern"; // needs to be retrieved from resource manager
    // May need tweaking once tested and
    String filter = "resource.type = project AND severity = NOTICE AND protoPayload.methodName:SetIamPolicy";
    //Test of ListLogEntriesRequest will be changed once logging is tested
    ListLogEntriesRequest request = ListLogEntriesRequest.newBuilder().setFilter(filter)
        .setOrderBy("timestamp desc").addResourceNames(project_id).build();
    ListLogEntriesPagedResponse response = logger.listLogEntries(request);
    return StreamSupport.stream(response.iterateAll().spliterator(), false)
        .collect(Collectors.toList());
    //Get resources one or multiple [PROJECT_ID], [ORGANIZATION_ID]
    //[BILLING_ACCOUNT_ID], [FOLDER_ID]
    //filter by audit log
    //Create new ListLogEntriesRequest with the information
    //Call for logs
  }

  /**
   * Function used to create create a {@code ListLogEntriesRequest} and retrieve all the relevant Recommendation logs
   * @return A list of all the relevant recommendation log entries that are stored by the logging API.
   */
  public Collection<LogEntry> listRecommendationLogs() {
    String project_id = "projects/concord-intern"; // needs to be retrieved from resource manager
    // May need tweaking once tested
    String filter = "resource.type = recommender";
    //Test of ListLogEntriesRequest will be changed once logging is tested
    ListLogEntriesRequest request = ListLogEntriesRequest.newBuilder().setFilter(filter)
        .setOrderBy("timestamp desc").addResourceNames(project_id).build();
    ListLogEntriesPagedResponse response = logger.listLogEntries(request);
    return StreamSupport.stream(response.iterateAll().spliterator(), false)
        .collect(Collectors.toList());
    //Get resources one or multiple [PROJECT_ID], [ORGANIZATION_ID]
    //[BILLING_ACCOUNT_ID], [FOLDER_ID]
    //filter by recommendation log
    //Create new ListLogEntriesRequest with the information
    //Call for logs
  }
}
