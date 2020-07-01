package com.google.impactdashboard.api_utilities;

import com.google.cloud.logging.v2.LoggingClient;
import com.google.logging.v2.LogEntry;
import java.io.IOException;
import java.util.Collection;

/** Class that handles all the retrieval of logs stored on the cloud logging API. */
public class LogRetriever {

  /** Cloud Logging client used to retrieve Audit logs and Recommendation logs */
  private LoggingClient logger;

  public LogRetriever() throws IOException {
    logger = LoggingClient.create();
  }

  /**
   * Function used to create a {@code ListLogEntriesRequest} and retrieve all the relevant audit logs
   * @return A list of all the relevant audit log entries that are stored by the logging API
   */
  public Collection<LogEntry> listAuditLogs(String[] resourceNames, String pageToken) {
    throw new UnsupportedOperationException("Not implemented");
  }

  /**
   * Function used to create create a {@code ListLogEntriesRequest} and retrieve all the relevant Recommendation logs
   * @return A list of all the relevant recommendation log entries that are stored by the logging API.
   */
  public Collection<LogEntry> listRecommendationLogs(String[] resourceNames, String pageToken) {
    throw new UnsupportedOperationException("Not implemented");
  }
}
