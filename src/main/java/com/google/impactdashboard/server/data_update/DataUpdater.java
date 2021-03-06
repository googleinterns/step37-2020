package com.google.impactdashboard.server.data_update;

import com.google.api.gax.rpc.PermissionDeniedException;
import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
import com.google.cloud.logging.v2.LoggingClient;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Strings;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManager;
import com.google.impactdashboard.server.api_utilities.IamBindingRetriever;
import com.google.impactdashboard.server.api_utilities.LogRetriever;
import com.google.impactdashboard.server.api_utilities.ResourceRetriever;
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

  protected final LogRetriever logRetriever;
  protected final RecommendationRetriever recommendationRetriever;
  protected final IamBindingRetriever iamRetriever;
  protected final DataUpdateManager updateManager;
  protected final DataReadManager readManager;
  protected final ResourceRetriever projectRetriever;

  @VisibleForTesting
  protected DataUpdater(LogRetriever logRetriever, RecommendationRetriever recommendationRetriever,
                      DataUpdateManager updateManager, DataReadManager readManager,
                      IamBindingRetriever iamRetriever, ResourceRetriever projectRetriever) {
    this.logRetriever = logRetriever;
    this.recommendationRetriever = recommendationRetriever;
    this.updateManager = updateManager;
    this.readManager = readManager;
    this.iamRetriever = iamRetriever;
    this.projectRetriever = projectRetriever;
  }

  /**
   * Updates the database with any new information about recommendations and IAMBinding logging.
   */
  public void updateDatabase() {
    List<ProjectIdentification> knownProjects = readManager.listProjects();
    List<ProjectIdentification> newProjects = projectRetriever.listResourceManagerProjects();
    ArrayList<ProjectIdentification> deprecatedProjects = new ArrayList<>(knownProjects);
    deprecatedProjects.removeAll(newProjects); // projects that are in the database that 
                                               // the user no longer has acces to
    knownProjects.removeAll(deprecatedProjects); //knownProjects now a subset of newProjects
    newProjects.removeAll(knownProjects);

    updateManager.updateRecommendations(listUpdatedRecommendations(knownProjects, newProjects));
    updateManager.updateIAMBindings(listUpdatedIAMBindingData(knownProjects, newProjects));
    updateManager.deleteYearOldData();
  }

  @VisibleForTesting
  protected List<Recommendation> listUpdatedRecommendations(
      List<ProjectIdentification> knownProjects, List<ProjectIdentification> newProjects) {
    throw new UnsupportedOperationException("Must be overriden.");
  } 

  @VisibleForTesting
  protected List<IAMBindingDatabaseEntry> listUpdatedIAMBindingData(
    List<ProjectIdentification> knownProjects, List<ProjectIdentification> newProjects) {
    throw new UnsupportedOperationException("Must be overriden.");
  }

  /**
   * Returns the list of recommendations for the projects in {@code projects} 
   * within the time window specified.
   */
  protected List<Recommendation> getRecommendationsForProjects(
    List<ProjectIdentification> projects, String timeFrom, String timeTo) {
    return projects.parallelStream()
      .map(project -> {
        try {
          ListLogEntriesPagedResponse response = logRetriever.listRecommendationLogs(
              project.getProjectId(), timeFrom, timeTo);
          List<LogEntry> entries = StreamSupport.stream(response.iterateAll().spliterator(), false)
              .collect(Collectors.toList());
          return recommendationRetriever.listRecommendations(
              entries, project.getProjectId(),
              Recommendation.RecommenderType.IAM_BINDING, iamRetriever);
        } catch (PermissionDeniedException e) {
          return new ArrayList<Recommendation>();
        }
      }).flatMap(List::stream).collect(Collectors.toList());
  }

  /** Returns all IAM Bindings data for {@code projects} in the time range given. */
  protected List<IAMBindingDatabaseEntry> getIAMBindingsDataEntries(
      List<ProjectIdentification> projects, Instant timeFrom, Instant timeTo) {
    return projects.parallelStream().flatMap(project -> {
      try {
        List<IAMBindingDatabaseEntry> iamBindingDatabaseEntries = new ArrayList<>();

        LoggingClient.ListLogEntriesPagedResponse response = logRetriever
            .listAuditLogsResponse(project.getProjectId(), timeFrom.toString(),
                timeTo == null ? "" : timeTo.toString(), 50, "");
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
      } catch (PermissionDeniedException e) {
        return new ArrayList<IAMBindingDatabaseEntry>().stream();
      }
    }).collect(Collectors.toList());
  }

  /**
   * Helper method for getting the newest info for projects that are not new. Retrieves only the
   * last log for the Iam data since we only needed the latest IAM data. Even if the Iam data is
   * old this creates a new Database entry for the day.
   * @param project the project that needs the last days of data
   * @param timeTo the earliest day to look for an entry.
   * @return the most recent IamBindingData
   */
  protected List<IAMBindingDatabaseEntry> getLastIamEntry(
      ProjectIdentification project, String timeTo) {
    try {
      long todayMidnight = Instant.ofEpochMilli(System.currentTimeMillis())
          .truncatedTo(ChronoUnit.DAYS).toEpochMilli();

      String pageToken = "";
      List<LogEntry> entry = new ArrayList<>();;
      do {
        LoggingClient.ListLogEntriesPagedResponse response = logRetriever.listAuditLogsResponse(
            project.getProjectId(), "", timeTo, 1, pageToken);
        entry = response.getPage().getResponse().getEntriesList();
        pageToken = response.getNextPageToken();
      } while (entry.isEmpty() && !Strings.isNullOrEmpty(pageToken));

      List<IAMBindingDatabaseEntry> lastEntry = iamRetriever
          .listIAMBindingData(entry, project.getProjectId(), project.getName(),
              String.valueOf(project.getProjectNumber()),
              timeTo.equals("") ? todayMidnight : null);
      return lastEntry;
    } catch (Exception e) {
      return new ArrayList<>();
    }
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
        .sorted((a,b) -> Long.compare(a.getTimestamp(), b.getTimestamp()))
        .collect(Collectors.toCollection(ArrayList::new));
    List<IAMBindingDatabaseEntry> oneEntryPerDay = new ArrayList<IAMBindingDatabaseEntry>();

    int sortedBindingsIndex = 0;
    while (timeFrom.toEpochMilli() < timeTo.toEpochMilli()) {
      Instant nextDay = timeFrom.plus(1L, ChronoUnit.DAYS);
      if (sortedBindings.get(sortedBindingsIndex).getTimestamp() >= nextDay.toEpochMilli()) {
        if (sortedBindingsIndex != 0) {
          oneEntryPerDay.add(copyWithNewTimestamp(
              sortedBindings.get(sortedBindingsIndex - 1), nextDay.toEpochMilli()));
        }
        timeFrom = nextDay;
      } else if (sortedBindingsIndex == sortedBindings.size() - 1 &&
          nextDay.toEpochMilli() > sortedBindings.get(sortedBindingsIndex).getTimestamp()) {
        oneEntryPerDay.add(copyWithNewTimestamp(
            sortedBindings.get(sortedBindingsIndex), nextDay.toEpochMilli()));
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
        entry.getIdentification(), timestamp, entry.getBindingsNumber());
  }
}
