package com.google.impactdashboard.server;

import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
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
  private final boolean manualUpdate;

  @VisibleForTesting
  protected DataUpdater(LogRetriever logRetriever, RecommendationRetriever recommendationRetriever,
                      DataUpdateManager updateManager, DataReadManager readManager,
                      IamBindingRetriever iamRetriever, boolean manualUpdate) {
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
    updateManager.updateRecommendations(listUpdatedRecommendations());
    updateManager.updateIAMBindings(listUpdatedIAMBindingData());
    updateManager.deleteYearOldData();
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
        ListLogEntriesPagedResponse response = logRetriever.listRecommendationLogs(
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
