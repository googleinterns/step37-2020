package com.google.impactdashboard.database_manager.data_read;

import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.database_manager.FakeDatabase;

import java.util.List;
import java.util.Map;

/** Class for mimicking a DataReadManager and returning fake data. */
public class DataReadManagerFake implements DataReadManager {
  
  /** 
   *  Returns a list containing identifying information for all projects in the 
   *  IAM Bindings table.  
   */
  @Override
  public List<ProjectIdentification> listProjects() {
    return FakeDatabase.listProjects();
  }

  /** 
   *  Returns the average number of IAM bindings that the project with id 
   *  {@code projectId} had per day over the past 365 days (or, if there are 
   *  not 365 days of data in the IAM Bindings table, the average over however 
   *  many days of data are in the table). 
   */
  @Override
  public double getAverageIAMBindingsInPastYear(String projectId) {
    return FakeDatabase.getAvgBindingsForProject(projectId);
  }

  /**
   *  Returns a map of dates (as timestamps in UTC milliseconds since the epoch) 
   *  to the Recommendation applied on that date to the project with id {@code projectId}.
   */
  @Override
  public Map<Long, Recommendation> getMapOfDatesToRecommendationTaken(String projectId) {
    return FakeDatabase.getDatesToRecommendationsForProject(projectId);
  }

  /** 
   *  Returns a map of dates (as timestamps in UTC milliseconds since the epoch) 
   *  to the number of IAM bindings that existed for the project with id {@code projectId} 
   *  on that date.
   */
  @Override
  public Map<Long, Integer> getMapOfDatesToIAMBindings(String projectId) {
    return FakeDatabase.getDatesToBindingsForProject(projectId);
  }

 /**
   * Returns the most recent timestamp in the IAM Bindings Table. If there is
   * nothing in the table, returns 0.
   */
  public long getMostRecentTimestamp() {
    return FakeDatabase.getMaxTimestamp();
  }
}
