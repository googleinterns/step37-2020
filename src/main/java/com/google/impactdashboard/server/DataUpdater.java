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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/** Class for updating the information in the database from the API. */
public class DataUpdater {

  private final LogRetriever logRetriever;
  private final RecommendationRetriever recommendationRetriever;
  private final IamBindingRetriever iamRetriever;
  private final DataUpdateManager updateManager;
  private final DataReadManager readManager;
  private final boolean manualUpdate;

  @VisibleForTesting
  protected DataUpdater(LogRetriever logRetriever, RecommendationRetriever recommendationRetriever,
                        DataUpdateManager updateManager, DataReadManager readManager,
                        IamBindingRetriever iamRetriever) {
    this.logRetriever = logRetriever;
    this.recommendationRetriever = recommendationRetriever;
    this.updateManager = updateManager;
    this.readManager = readManager;
    this.iamRetriever = iamRetriever;
    this.manualUpdate = manualUpdate;
  }

  /**
   * Static factory for creating a new instance of DataUpdater with new instances of LogRetriever
   * and RecommendationRetriever.
   * @return New instance of DataUpdater
   */
  public static DataUpdater create(boolean manualUpdate) throws Exception {
    return new DataUpdater(LogRetriever.create(), RecommendationRetriever.create(),
        DataUpdateManagerFactory.create(), DataReadManagerFactory.create(),
        IamBindingRetriever.create(), manualUpdate);
  }

  /**
   * Updates the database with any new information about recommendations and IAMBinding logging.
   */
  public void updateDatabase() {
//    updateManager.updateRecommendations(listUpdatedRecommendations());
    updateManager.updateIAMBindings(listUpdatedIAMBindingData());
//    updateManager.deleteYearOldData();
  }

  /**
   * Gets the new Recommendation data from the Recommender API.
   * @return a List of Recommendations
   */
  private List<Recommendation> listUpdatedRecommendations() {
    List<ProjectIdentification> knownProjects = readManager.listProjects();
    List<ProjectIdentification> newProjects = ProjectListRetriever.listResourceManagerProjects();
    newProjects.removeAll(knownProjects);

    if (manualUpdate) {
      return listAllRecommendationsExcludingCurrentDay(newProjects);
    } else {
      return listAllNewRecommendations(knownProjects, newProjects);
    }
  }

  /**
   * For all new projects, gets all recommendations that ocurred in the past 30
   * days, excluding any recommendations that occurred after midnight, today.
   * @param newProjects The projects that have no data in the database.
   * @return A list containing all new recommendations to be stored.
   */
  private List<Recommendation> listAllRecommendationsExcludingCurrentDay(
    List<ProjectIdentification> newProjects) {
    String todayAtMidnight = Instant.ofEpochSecond(System.currentTimeMillis() / 1000)
      .truncatedTo(ChronoUnit.DAYS).toString();

    List<Recommendation> newProjectRecommendations = getRecommendationsForProjects(
      newProjects, "", todayAtMidnight);

    return newProjectRecommendations;
  }

  /**
   * For {@code knownProjects}, gets any recommendations that occured in the
   * past 24 hours. For {@code newProjects}, gets all known recommendations.
   * @param knownProjects The projects that the database already knows about.
   * @param newProjects The projects that have no data in the database currently.
   * @return A list containing all new recommendations to be stored.
   */
  private List<Recommendation> listAllNewRecommendations(
    List<ProjectIdentification> knownProjects, List<ProjectIdentification> newProjects) {
    String yesterdayAtMidnight = Instant.ofEpochSecond(System.currentTimeMillis() / 1000)
      .truncatedTo(ChronoUnit.DAYS)
      .minus(1L, ChronoUnit.DAYS)
      .toString();

    List<Recommendation> newProjectRecommendations = getRecommendationsForProjects(
      newProjects, "", "");
    List<Recommendation> knownProjectRecommendations = getRecommendationsForProjects(
      knownProjects, yesterdayAtMidnight, "");

    newProjectRecommendations.addAll(knownProjectRecommendations);
    return newProjectRecommendations;
  }

  /**
   * Returns the list of recommendations for the projects in {@code projects}
   * within the time window specified.
   */
  private List<Recommendation> getRecommendationsForProjects(List<ProjectIdentification> projects,
    String timeFrom, String timeTo) {
    return projects.parallelStream()
      .map(project -> {
        LoggingClient.ListLogEntriesPagedResponse response = logRetriever.listRecommendationLogs(
          project.getProjectId(), timeFrom, timeTo);
        List<LogEntry> entries = StreamSupport.stream(response.iterateAll().spliterator(), false)
          .collect(Collectors.toList());
        return recommendationRetriever.listRecommendations(
          entries, project.getProjectId(),
          Recommendation.RecommenderType.IAM_BINDING, iamRetriever);
      }).flatMap(List::stream).collect(Collectors.toList());
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
      String midnight30DaysAgo = Instant.ofEpochSecond(System.currentTimeMillis() / 1000)
          .truncatedTo(ChronoUnit.DAYS)
          .minus(30L, ChronoUnit.DAYS)
          .toString();

      List<IAMBindingDatabaseEntry> iamBindingDatabaseEntries = new ArrayList<>();
        LoggingClient.ListLogEntriesPagedResponse response = logRetriever.listAuditLogsResponse(project.getProjectId(), midnight30DaysAgo,
            50);
        List<LogEntry> entriesLog = StreamSupport.stream(response.iterateAll().spliterator(), false)
            .collect(Collectors.toList());
        iamBindingDatabaseEntries.addAll(iamRetriever.listIAMBindingData(entriesLog,
            project.getProjectId(), project.getName(), String.valueOf(project.getProjectNumber()),
            null));
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
    long yesterdayMidnight = Instant.ofEpochSecond(System.currentTimeMillis() / 1000)
        .truncatedTo(ChronoUnit.DAYS)
        .minus(1L, ChronoUnit.DAYS).getEpochSecond();

    LoggingClient.ListLogEntriesPagedResponse response = logRetriever.listAuditLogsResponse(
        project.getProjectId(), "", 1);
    List<LogEntry> entry = response.getPage().getResponse().getEntriesList();

    return iamRetriever.listIAMBindingData(entry, project.getProjectId(), project.getName(),
        String.valueOf(project.getProjectNumber()), yesterdayMidnight * 1000);
  }

  public static void main(String[] args) throws Exception {
    DataUpdater dataUpdater = DataUpdater.create();
    List<IAMBindingDatabaseEntry> entries = dataUpdater.listUpdatedIAMBindingData();
  }
}
