package com.google.impactdashboard.database_manager.data_read;

import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.Recommendation;
import java.util.List;
import java.util.Map;

/** Interface for retrieving data from the database. */
public interface DataReadManager {
  /** 
   *  Returns a list containing identifying information for all projects in the 
   *  IAM Bindings table.  
   */
  public List<ProjectIdentification> listProjects();

  /** 
   *  Returns the average number of IAM bindings that the project with id 
   *  {@code projectId} had per day over the past 365 days (or, if there are 
   *  not 365 days of data in the IAM Bindings table, the average over however 
   *  many days of data are in the table). If the project has no data, returns 0.
   */
  public double getAverageIAMBindingsInPastYear(String projectId);

  /**
   *  Returns a map of dates (as timestamps in UTC milliseconds since the epoch) 
   *  to the Recommendation applied on that date to the project with id {@code projectId}.
   */
  public Map<Long, Recommendation> getMapOfDatesToRecommendationTaken(String projectId);

  /** 
   *  Returns a map of dates (as timestamps in UTC milliseconds since the epoch) 
   *  to the number of IAM bindings that existed for the project with id {@code projectId} 
   *  on that date.
   */
  public Map<Long, Integer> getMapOfDatesToIAMBindings(String projectId);
}
