package com.google.impactdashboard.server;

import com.google.cloud.logging.v2.LoggingClient;
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
import com.google.impactdashboard.server.api_utilities.ProjectListRetriever;
import com.google.impactdashboard.server.api_utilities.RecommendationRetriever;
import com.google.logging.v2.LogEntry;
import org.checkerframework.checker.units.qual.A;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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
    long epochSeconds = readManager.getMostRecentTimestamp();
    List<IAMBindingDatabaseEntry> entries = new ArrayList<>();
    if(epochSeconds != -1) {
      entries = readManager.listProjects().parallelStream().flatMap(project -> getLastIamEntry(project)
          .stream()).collect(Collectors.toList());
    }
    // Getting the last 30 days of data from new projects
    entries.addAll(ProjectListRetriever.listResourceManagerProjects().parallelStream().flatMap(project -> {
      Calendar calendar = Calendar.getInstance();
      calendar.add(Calendar.DATE, -30);
      calendar.set(Calendar.HOUR_OF_DAY, 0);
      calendar.set(Calendar.MINUTE, 0);
      calendar.set(Calendar.SECOND, 0);
      calendar.set(Calendar.MILLISECOND, 0);
      List<IAMBindingDatabaseEntry> iamBindingDatabaseEntries = new ArrayList<>();
      LoggingClient.ListLogEntriesPagedResponse response;
      do {
        response = logRetriever.
            listAuditLogsResponse(project.getProjectId(), calendar.toInstant().toString(), 50,
                null);
        List<LogEntry> entry = StreamSupport.stream(response.iterateAll().spliterator(), false)
            .collect(Collectors.toList());
        iamBindingDatabaseEntries.addAll(iamRetriever.listIAMBindingData(entry,
            project.getProjectId(), project.getName(), String.valueOf(project.getProjectNumber()),
            null));
      } while(response.getNextPageToken() != null);
      return iamBindingDatabaseEntries.stream();
    }).collect(Collectors.toList()));

    return entries;
  }

  /**
   * Helper method for getting the newest info for projects that are not new. Retrieves only the
   * last log for the Iam data since we only needed the latest IAM data. Even if the Iam data is
   * old this creates a new Database entry for the day.
   * @param project the project that needs the last days of data
   * @return the most recent IamBindingData
   */
  private List<IAMBindingDatabaseEntry> getLastIamEntry(ProjectIdentification project) {
    LoggingClient.ListLogEntriesPagedResponse response = logRetriever.listAuditLogsResponse(
        project.getProjectId(), "", 1, null);
    List<LogEntry> entry = StreamSupport.stream(response.iterateAll().spliterator(), false)
        .collect(Collectors.toList());
    Calendar calendar = Calendar.getInstance();
    calendar.add(Calendar.DATE, 0);
    calendar.set(Calendar.HOUR_OF_DAY, 23);
    calendar.set(Calendar.MINUTE, 59);
    calendar.set(Calendar.SECOND, 59);
    calendar.set(Calendar.MILLISECOND, 0);
    return iamRetriever.listIAMBindingData(entry, project.getProjectId(), project.getName(),
        String.valueOf(project.getProjectNumber()), calendar.toInstant().getEpochSecond());
  }
}
