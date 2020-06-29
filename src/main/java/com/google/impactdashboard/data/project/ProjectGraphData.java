package com.google.impactdashboard.data.project;

import java.util.Map;
import com.google.impactdashboard.data.recommendation.Recommendation;

/** The data necessary to graph a single project. */
public class ProjectGraphData {

  public String projectId;
  public Map<Long, Integer> numberIAMBindingsOnDate;
  public Map<Long, Recommendation> recommendationsAppliedOnDate;

  /** 
   * Create an {@code ProjectGraphData} object for project {@code projectId}, where 
   * a mapping in {@code numerIAMBindingsOnDate} is a date represented in UTC milliseconds 
   * since the epoch mapped to the number of IAM Bindings on that date, and a mapping 
   * in {@code recommendationsAppliedOnDate} is a date represented in UTC milliseconds 
   * since the epoch mapped to a {@code Recommendation} object representing 
   * the IAM Bindings recommendation that was applied on that date.
   */
  public ProjectGraphData(String projectId, Map<Long, Integer> numberIAMBindingsOnDate, 
    Map<Long, Recommendation> recommendationsAppliedOnDate) {
    this.projectId = projectId;
    this.numberIAMBindingsOnDate = numberIAMBindingsOnDate;
    this.recommendationsAppliedOnDate = recommendationsAppliedOnDate;
  }

}
