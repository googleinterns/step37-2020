package com.google.impactdashboard.server.api_utilities;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.audit.AuditLog;
import com.google.cloud.logging.v2.LoggingClient;
import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
import com.google.cloud.logging.v2.LoggingSettings;
import com.google.cloud.logging.v2.stub.LoggingServiceV2StubSettings;
import com.google.logging.v2.ListLogEntriesRequest;
import com.google.logging.v2.LogEntry;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.ListValue;
import com.google.protobuf.Value;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
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
    // Change logging client initialization to settings
    LoggingServiceV2StubSettings stub = LoggingServiceV2StubSettings.newBuilder()
        .setCredentialsProvider(() -> {
          GoogleCredentials credentials;
          try {
            credentials = GoogleCredentials
                // The path will be changed to use the constants class when it is merged into main
                .fromStream(new FileInputStream("/usr/local/google/home/ionis/Documents/credentials.json"));
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
   * @return A list of all the relevant audit log entries that are stored by the logging API
   */
  public Collection<LogEntry> listAuditLogs() {
    String project_id = "projects/concord-intern"; // needs to be retrieved from resource manager
    // May need tweaking once tested and
    String filter = "resource.type = project AND severity = NOTICE AND " +
        "protoPayload.methodName:SetIamPolicy";
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
   * Creates a {@code ListLogEntriesRequest} and retrieves all the relevant Recommendation logs.
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

  public static void main(String[] args) throws Exception {
    LogRetriever logRetriever = LogRetriever.create();

    IamBindingRetriever iamBindingRetriever = IamBindingRetriever.create();

    iamBindingRetriever.listIAMBindingData(logRetriever.listAuditLogs(), "concord-intern",
        "Concord Intern", "12345");
  }
}
