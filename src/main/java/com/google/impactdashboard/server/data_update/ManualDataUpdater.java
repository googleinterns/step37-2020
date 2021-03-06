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
import com.google.impactdashboard.server.api_utilities.ResourceRetriever;
import com.google.impactdashboard.server.api_utilities.RecommendationRetriever;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/** 
 * Class that carries out data update where only new projects are updated and
 * the current day is excluded. Intended to be performed manually by the dploying 
 * user when new projects are added. 
 */
public class ManualDataUpdater extends DataUpdater {

  @VisibleForTesting
  protected ManualDataUpdater(LogRetriever logRetriever, 
      RecommendationRetriever recommendationRetriever,
      DataUpdateManager updateManager, DataReadManager readManager,
      IamBindingRetriever iamRetriever, ResourceRetriever projectRetriever) {
    super(logRetriever, recommendationRetriever, updateManager, readManager, 
        iamRetriever, projectRetriever);
  }

  /**
   * Static factory for creating a new instance of ManualDataUpdater.
   * @return New instance of DataUpdater
   */
  public static ManualDataUpdater create() 
      throws IOException, GeneralSecurityException {
    return new ManualDataUpdater(LogRetriever.create(), RecommendationRetriever.create(),
        DataUpdateManagerFactory.create(), DataReadManagerFactory.create(),
        IamBindingRetriever.create(), ResourceRetriever.getInstance());
  }

  /**
   * For all new projects, gets all recommendations that ocurred in the past 30 
   * days, excluding any recommendations that occurred after midnight, today.
   * @param newProjects The projects that have no data in the database.
   * @return A list containing all new recommendations to be stored.
   */
  @VisibleForTesting
  @Override
  protected List<Recommendation> listUpdatedRecommendations(
      List<ProjectIdentification> knownProjects, List<ProjectIdentification> newProjects) {
    String todayAtMidnight = Instant.ofEpochMilli(System.currentTimeMillis())
      .truncatedTo(ChronoUnit.DAYS).toString();
    List<Recommendation> newProjectRecommendations = getRecommendationsForProjects(
      newProjects, "", todayAtMidnight);
    return newProjectRecommendations;  
  }

  /**
   * For all new projects, gets the past 30 days of IAM Bindings information, 
   * except the current day.   
   * @return A List of IAMBindingDatabaseEntry
   */
  @VisibleForTesting
  @Override
  protected List<IAMBindingDatabaseEntry> listUpdatedIAMBindingData(
      List<ProjectIdentification> knownProjects, List<ProjectIdentification> newProjects) {
    Instant midnight30DaysAgo = Instant.ofEpochMilli(System.currentTimeMillis())
        .truncatedTo(ChronoUnit.DAYS)
        .minus(30L, ChronoUnit.DAYS);
    Instant midnightToday = Instant.ofEpochMilli(System.currentTimeMillis())
      .truncatedTo(ChronoUnit.DAYS);
    List<IAMBindingDatabaseEntry> entries =  
        getIAMBindingsDataEntries(newProjects, midnight30DaysAgo, midnightToday);
    return entries;  
  }
}
