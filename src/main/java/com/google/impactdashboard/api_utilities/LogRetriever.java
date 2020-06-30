package com.google.impactdashboard.api_utilities;

import com.google.cloud.logging.v2.LoggingClient;

import java.io.IOException;

public class LogRetriever {

  /** Cloud Logging client used to retrieve Audit logs and Recommendation logs */
  private LoggingClient logger;

  public LogRetriever() throws IOException {
    logger = LoggingClient.create();
  }
}
