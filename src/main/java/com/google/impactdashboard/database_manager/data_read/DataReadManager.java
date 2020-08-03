package com.google.impactdashboard.database_manager.data_read;

import com.google.impactdashboard.data.organization.OrganizationIdentification;
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
   * Returns a list containing the identifying information of every organization
   * present in the IAM Bindings table. 
   */
  public List<OrganizationIdentification> listOrganizations();

  /** 
   *  Returns the average number of IAM bindings that the project with id 
   *  {@code projectId} had per day over the past 365 days (or, if there are 
   *  not 365 days of data in the IAM Bindings table, the average over however 
   *  many days of data are in the table). 
   */
  public double getAverageIAMBindingsInPastYear(String projectId);

  /**
   * Returns the average number of bindings summed across every project belonging to
   * the organization with id {@code organizationId} over however many days of data
   * are in the IAM Bindings table. 
   */
  public double getOrganizationAvgBindingsInPastYear(String organizationId);

  /**
   *  Returns a map of dates (as timestamps in UTC milliseconds since the epoch) 
   *  to the Recommendation applied on that date to the project with id {@code projectId}.
   */
  public Map<Long, Recommendation> getMapOfDatesToRecommendationTaken(String projectId);

  /**
   * Returns a map of dates as timestamps in UTC milliseconds since the epoch
   * to the Recommendation applied on that timestamp, where the project that the 
   * Recommendation was applied to belongs to the organization with id 
   * {@code organizationId}.
   */
  public Map<Long, Recommendation> getOrganizationDatesToRecommendations(String organizationId);

  /** 
   *  Returns a map of dates (as timestamps in UTC milliseconds since the epoch) 
   *  to the number of IAM bindings that existed for the project with id {@code projectId} 
   *  on that date.
   */
  public Map<Long, Integer> getMapOfDatesToIAMBindings(String projectId);

  /**
   * Returns a map of dates as timestamps in UTC milliseconds since the epoch
   * to the number of IAM Bindings that existed for all projects that the dashboard 
   * has access to that belong to the organization with id {@code organizationId},
   * on that date.
   */
  public Map<Long, Integer> getOrganizationDatesToBindings(String organizationId);

  /**
   * Returns the most recent timestamp in the IAM Bindings Table. If there is
   * nothing in the table, returns -1.
   */
  public long getMostRecentTimestamp();
}
