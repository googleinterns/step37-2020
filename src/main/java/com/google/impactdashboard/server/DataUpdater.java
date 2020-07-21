package com.google.impactdashboard.server;

import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
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

import java.io.IOException;
import java.security.GeneralSecurityException;
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
  private final ProjectListRetriever projectRetriever;
  private final boolean manualUpdate;

  @VisibleForTesting
  protected DataUpdater(LogRetriever logRetriever, RecommendationRetriever recommendationRetriever,
                      DataUpdateManager updateManager, DataReadManager readManager,
                      IamBindingRetriever iamRetriever, ProjectListRetriever projectRetriever,
                      boolean manualUpdate) {
    this.logRetriever = logRetriever;
    this.recommendationRetriever = recommendationRetriever;
    this.updateManager = updateManager;
    this.readManager = readManager;
    this.iamRetriever = iamRetriever;
    this.projectRetriever = projectRetriever;
    this.manualUpdate = manualUpdate;
  }

  /**
   * Static factory for creating a new instance of DataUpdater with new instances of LogRetriever
   * and RecommendationRetriever.
   * @return New instance of DataUpdater
   */
  public static DataUpdater create(boolean manualUpdate) 
      throws IOException, GeneralSecurityException {
    return new DataUpdater(LogRetriever.create(), RecommendationRetriever.create(),
        DataUpdateManagerFactory.create(), DataReadManagerFactory.create(),
        IamBindingRetriever.create(), ProjectListRetriever.getInstance(), manualUpdate);
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
  @VisibleForTesting
  protected List<Recommendation> listUpdatedRecommendations() {
    List<ProjectIdentification> knownProjects = readManager.listProjects();
    List<ProjectIdentification> newProjects = projectRetriever.listResourceManagerProjects();
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
    String todayAtMidnight = Instant.ofEpochMilli(System.currentTimeMillis())
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
    String yesterdayAtMidnight = Instant.ofEpochMilli(System.currentTimeMillis())
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
  @VisibleForTesting
  protected List<IAMBindingDatabaseEntry> listUpdatedIAMBindingData() {
    List<ProjectIdentification> knownProjects = readManager.listProjects();
    List<ProjectIdentification> newProjects = projectRetriever.listResourceManagerProjects();
    newProjects.removeAll(knownProjects);

    if (manualUpdate) {
      return newIAMBindingsDataExcludingToday(newProjects);
    } else {
      return newIAMBindingsData(newProjects, knownProjects);
    }
  }

  /** Returns all IAM Bindings data for {@code projects} in the time range given. */
  private List<IAMBindingDatabaseEntry> getIAMBindingsDataEntries(
      List<ProjectIdentification> projects, Instant timeFrom, Instant timeTo) {
    return projects.parallelStream().flatMap(project -> {
      List<IAMBindingDatabaseEntry> iamBindingDatabaseEntries = new ArrayList<>();

      LoggingClient.ListLogEntriesPagedResponse response = logRetriever
          .listAuditLogsResponse(project.getProjectId(), timeFrom.toString(), 
              timeTo == null ? "" : timeTo.toString(), 50);
      List<LogEntry> iamBindingsLogs = StreamSupport
          .stream(response.iterateAll().spliterator(), false).collect(Collectors.toList());

      iamBindingDatabaseEntries.addAll(iamRetriever.listIAMBindingData(iamBindingsLogs,
          project.getProjectId(), project.getName(), 
          String.valueOf(project.getProjectNumber()),
          null));
      iamBindingDatabaseEntries.addAll(getLastIamEntry(project, timeFrom.toString()));

      return createListWithOneEntryPerDay(iamBindingDatabaseEntries, timeFrom, 
          timeTo == null ? 
              Instant.ofEpochMilli(System.currentTimeMillis())
                  .truncatedTo(ChronoUnit.DAYS).plus(1L, ChronoUnit.DAYS) : 
              timeTo)
          .stream();
    }).collect(Collectors.toList());
  }

  /**
   * For all new projects, gets the past 30 days of IAM Bindings information, 
   * except the current day.
   */
  private List<IAMBindingDatabaseEntry> newIAMBindingsDataExcludingToday(
      List<ProjectIdentification> newProjects) {
    Instant midnight30DaysAgo = Instant.ofEpochMilli(System.currentTimeMillis())
        .truncatedTo(ChronoUnit.DAYS)
        .minus(30L, ChronoUnit.DAYS);
    Instant midnightToday = Instant.ofEpochMilli(System.currentTimeMillis())
      .truncatedTo(ChronoUnit.DAYS);
    List<IAMBindingDatabaseEntry> entries =  
        getIAMBindingsDataEntries(newProjects, midnight30DaysAgo, midnightToday);
    return entries;
  }

  /**
   * For new projects, gets the past 30 days of IAM Bindings; for old projects, 
   * gets the IAM Bindings for the previous day.
   */
  private List<IAMBindingDatabaseEntry> newIAMBindingsData(
      List<ProjectIdentification> newProjects, List<ProjectIdentification> knownProjects) {
    Instant midnight30DaysAgo = Instant.ofEpochMilli(System.currentTimeMillis())
        .truncatedTo(ChronoUnit.DAYS)
        .minus(30L, ChronoUnit.DAYS);
    List<IAMBindingDatabaseEntry> entries = getIAMBindingsDataEntries(
        newProjects, midnight30DaysAgo, null);
    entries.addAll(knownProjects.parallelStream().flatMap(project -> 
        getLastIamEntry(project, "").stream()).collect(Collectors.toList()));
    return entries;
  }

  /**
   * Helper method for getting the newest info for projects that are not new. Retrieves only the
   * last log for the Iam data since we only needed the latest IAM data. Even if the Iam data is
   * old this creates a new Database entry for the day.
   * @param project the project that needs the last days of data
   * @param timeTo the earliest day to look for an entry.
   * @return the most recent IamBindingData
   */
  private List<IAMBindingDatabaseEntry> getLastIamEntry(
      ProjectIdentification project, String timeTo) {
    long yesterdayMidnight = Instant.ofEpochMilli(System.currentTimeMillis())
        .truncatedTo(ChronoUnit.DAYS)
        .minus(1L, ChronoUnit.DAYS).toEpochMilli();

    LoggingClient.ListLogEntriesPagedResponse response = logRetriever.listAuditLogsResponse(
        project.getProjectId(), "", timeTo, 1);
    List<LogEntry> entry = response.getPage().getResponse().getEntriesList();

    List<IAMBindingDatabaseEntry> lastEntry =  iamRetriever
        .listIAMBindingData(entry, project.getProjectId(), project.getName(),
            String.valueOf(project.getProjectNumber()), 
            timeTo.equals("") ? yesterdayMidnight : null);
    return lastEntry;
  }

  /**
   * Returns the data contained in {@code bindingsData}, such that there is 
   * exactly one entry for each day in the range from {@code timeFrom} to 
   * {@code timeTo}. If there are multiple entries for a single day in 
   * {@code bindingsData}, the latest entry will be recorded in the output.
   * @param bindingsData All logs entry bindings data for one project.
   * @param timeFrom A date (at midnight) to start the time range.
   * @param timeTo A date (at midnight) to end the time range.
   * @return The data collapsed so that there is exactly one entry per day.
   */
  private List<IAMBindingDatabaseEntry> createListWithOneEntryPerDay(
      List<IAMBindingDatabaseEntry> bindingsData, Instant timeFrom, Instant timeTo) {
    if (bindingsData.size() == 0) {
      return bindingsData;
    }

    List<IAMBindingDatabaseEntry> sortedBindings = bindingsData.stream()
        .sorted(IAMBindingDatabaseEntry.ORDER_BY_TIMESTAMP)
        .collect(Collectors.toCollection(ArrayList::new));
    List<IAMBindingDatabaseEntry> oneEntryPerDay = new ArrayList<IAMBindingDatabaseEntry>();

    int sortedBindingsIndex = 0;
    while (timeFrom.toEpochMilli() < timeTo.toEpochMilli()) {
      Instant nextDay = timeFrom.plus(1L, ChronoUnit.DAYS);
      if (sortedBindings.get(sortedBindingsIndex).getTimestamp() >= nextDay.toEpochMilli()) {
        if (sortedBindingsIndex != 0) {
          oneEntryPerDay.add(copyWithNewTimestamp(
              sortedBindings.get(sortedBindingsIndex - 1), timeFrom.toEpochMilli()));
        }
        timeFrom = nextDay;
      } else if (sortedBindingsIndex == sortedBindings.size() - 1 &&
          nextDay.toEpochMilli() > sortedBindings.get(sortedBindingsIndex).getTimestamp()) {
        oneEntryPerDay.add(copyWithNewTimestamp(
            sortedBindings.get(sortedBindingsIndex), timeFrom.toEpochMilli()));
        timeFrom = nextDay;
      } else if (sortedBindingsIndex < sortedBindings.size() - 1) {
        sortedBindingsIndex += 1;
      }
    }
    return oneEntryPerDay;
  }

  /** Returns a copy of {@code entry} with timestamp {@code timestamp}. */
  private IAMBindingDatabaseEntry copyWithNewTimestamp(IAMBindingDatabaseEntry entry, 
      long timestamp) {
    return IAMBindingDatabaseEntry.create(entry.getProjectId(), 
        entry.getProjectName(), entry.getProjectNumber(), 
        timestamp, entry.getBindingsNumber());
  }
}
