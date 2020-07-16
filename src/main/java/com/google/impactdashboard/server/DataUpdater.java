package com.google.impactdashboard.server;

import com.google.common.annotations.VisibleForTesting;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import com.google.impactdashboard.database_manager.data_read.DataReadManagerFactory;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManager;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManagerFactory;
import com.google.impactdashboard.server.api_utilities.IamBindingRetriever;
import com.google.impactdashboard.server.api_utilities.LogRetriever;
import com.google.impactdashboard.server.api_utilities.RecommendationRetriever;
import com.google.logging.v2.LogEntry;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

/** Class for updating the information in the database from the API. */
public class DataUpdater {

  private final LogRetriever logRetriever;
  private final RecommendationRetriever recommendationRetriever;
  private final IamBindingRetriever iamRetriever;
  private final DataUpdateManager updateManager;
  private final DataReadManager readManager;

  @VisibleForTesting
  protected DataUpdater(LogRetriever logRetriever, RecommendationRetriever recommendationRetriever,
                      DataUpdateManager updateManager, DataReadManager readManager,
                      IamBindingRetriever iamRetriever) {
    this.logRetriever = logRetriever;
    this.recommendationRetriever = recommendationRetriever;
    this.updateManager = updateManager;
    this.readManager = readManager;
    this.iamRetriever = iamRetriever;
  }

  /**
   * Static factory for creating a new instance of DataUpdater with new instances of LogRetriever
   * and RecommendationRetriever.
   * @return New instance of DataUpdater
   */
  public static DataUpdater create() throws Exception {
    return new DataUpdater(LogRetriever.create(), RecommendationRetriever.create(),
        DataUpdateManagerFactory.create(), DataReadManagerFactory.create(),
        IamBindingRetriever.create());
  }

  /**
   * Updates the database with any new information about recommendations and IAMBinding logging.
   */
  public void updateDatabase() {
    updateManager.updateRecommendations(listUpdatedRecommendations());
    updateManager.updateIAMBindings(listUpdatedIAMBindingData());
    updateManager.deleteYearOldData();
  }

  /**
   * Gets the new Recommendation data from the Recommender API.
   * @return a List of Recommendations
   */
  private List<Recommendation> listUpdatedRecommendations() {
    // Steps for implementing this function (may require more methods for single responsibility)
    // retrieve recommendations from cloud logging and recommender
    // retrieve current recommendations stored by database
    // filter out any duplicate recommendations
    // add non duplicate recommendation to the database
    throw new UnsupportedOperationException("Not Implemented");
  }

  /**
   * Lists the new IAM Binding data from the cloud logging API
   * @return A List of IAMBindingDatabaseEntry
   */
  private List<IAMBindingDatabaseEntry> listUpdatedIAMBindingData() {
    // Steps for implementing this function (may require more methods for single responsibility)
    // retrieve IAMBinding from database
    // (TODO determine whether to retrieve all info or info for a certain time range)
    // filter out any duplicate IAM Information
    // retrieve IAMBinding information from cloud logging and IAM API
    // add non duplicates to database
    List<ProjectIdentification> projects = readManager.listProjects();
    AtomicReference<String> timeStamp = new AtomicReference<>("");
    long epochSeconds = readManager.getMostRecentTimestamp();
    if(epochSeconds != -1) {
      timeStamp.set(Instant.ofEpochSecond(epochSeconds).toString());
    }
    return projects.parallelStream().map(project -> {
      List<LogEntry> auditLogs = (List<LogEntry>) logRetriever.listAuditLogs(project.getProjectId(), timeStamp
          .toString());
      return iamRetriever.listIAMBindingData(auditLogs, project.getProjectId(), project.getName(),
          String.valueOf(project.getProjectNumber()));
    }).flatMap(List::stream).collect(Collectors.toList());
  }

}
