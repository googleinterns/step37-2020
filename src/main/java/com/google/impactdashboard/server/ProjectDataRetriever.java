package com.google.impactdashboard.server;

import com.google.impactdashboard.data.project.ProjectGraphData;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import com.google.impactdashboard.database_manager.data_read.DataReadManagerFactory;

import java.util.Map;

/** Retrieves all the data from a project in the database */
public class ProjectDataRetriever {

  private DataReadManager readManager;

  private ProjectDataRetriever(DataReadManager readManager) {
    this.readManager = readManager;
  }

  /**
   * Static factory for creating a ProjectDataRetriever with a new instance of DataReadManager.
   * @return New instance of ProjectDataRetriever
   */
  public static ProjectDataRetriever create() {
    return new ProjectDataRetriever(DataReadManagerFactory.create());
  }

  /**
   * Static factory for creating a ProjectDataRetriever with a pre-made instance of DataReadManager.
   * @return New instance of ProjectDataRetriever
   */
  public static ProjectDataRetriever create(DataReadManager readManager) {
    return new ProjectDataRetriever(readManager);
  }

  /**
   * Gets the information about the project specified by the projectId from the database.
   * @param projectId The id of the project the data is being retrieved from
   * @return The ProjectGraphData from the projectId that was specified
   */
  public ProjectGraphData getProjectData(String projectId) {
    Map<Long, Integer> numberIAMBindingsOnDate =
        readManager.getMapOfDatesToIAMBindings(projectId);
    Map<Long, Recommendation> recommendationsAppliedOnDate =
        readManager.getMapOfDatesToRecommendationTaken(projectId);
    return ProjectGraphData.create(projectId, numberIAMBindingsOnDate,
        recommendationsAppliedOnDate);
  }

}
