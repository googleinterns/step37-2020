package com.google.impactdashboard.api_utilities;

import com.google.cloud.logging.v2.LoggingClient;

import java.io.IOException;

public class LogRetriever {

  private LoggingClient logger;

  public LogRetriever() throws IOException {
    logger = LoggingClient.create();
  }

}
