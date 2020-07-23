package com.google.impactdashboard.server.data_update;

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
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/** 
 * Class that carries out data update that retrieves 30 days of data for new 
 * projects and 1 day of data for old projects. Intended to be run at a regular 
 * time by automated process. 
 */
public class AutomaticDataUpdater extends DataUpdater {

  @VisibleForTesting
  protected AutomaticDataUpdater(LogRetriever logRetriever, 
      RecommendationRetriever recommendationRetriever,
      DataUpdateManager updateManager, DataReadManager readManager,
      IamBindingRetriever iamRetriever, ProjectListRetriever projectRetriever) {
    super(logRetriever, recommendationRetriever, updateManager, readManager, 
        iamRetriever, projectRetriever);
  }

  /**
   * Static factory for creating a new instance of AutomaticDataUpdater.
   * @return New instance of DataUpdater
   */
  public static AutomaticDataUpdater create() 
      throws IOException, GeneralSecurityException {
    return new AutomaticDataUpdater(LogRetriever.create(), RecommendationRetriever.create(),
        DataUpdateManagerFactory.create(), DataReadManagerFactory.create(),
        IamBindingRetriever.create(), ProjectListRetriever.getInstance());
  }

  /**
   * Gets the new Recommendation data from the Recommender API.
   * @return a List of Recommendations
   */
  @VisibleForTesting
  @Override
  protected List<Recommendation> listUpdatedRecommendations() {
    List<ProjectIdentification> knownProjects = readManager.listProjects();
    List<ProjectIdentification> newProjects = projectRetriever.listResourceManagerProjects();
    newProjects.removeAll(knownProjects);
    return listAllNewRecommendations(knownProjects, newProjects);
  }

  /**
   * Lists the new IAM Binding data from the cloud logging API
   * @return A List of IAMBindingDatabaseEntry
   */
  @VisibleForTesting
  @Override
  protected List<IAMBindingDatabaseEntry> listUpdatedIAMBindingData() {
    List<ProjectIdentification> knownProjects = readManager.listProjects();
    List<ProjectIdentification> newProjects = projectRetriever.listResourceManagerProjects();
    newProjects.removeAll(knownProjects);
    return newIAMBindingsData(newProjects, knownProjects);
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
  
}