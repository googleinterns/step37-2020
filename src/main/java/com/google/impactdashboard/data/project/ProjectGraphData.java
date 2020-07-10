package com.google.impactdashboard.data.project;

import java.util.Map;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.auto.value.AutoValue;

/** The data necessary to graph a single project. */
@AutoValue
public abstract class ProjectGraphData {

  public abstract String getProjectId();
  public abstract Map<Long, Integer> getNumberIAMBindingsOnDate();
  public abstract Map<Long, Recommendation> getRecommendationsAppliedOnDate();

  /** 
   * Create an {@code ProjectGraphData} object for project {@code projectId}, where 
   * a mapping in {@code numerIAMBindingsOnDate} is a date represented in UTC milliseconds 
   * since the epoch mapped to the number of IAM Bindings on that date, and a mapping 
   * in {@code recommendationsAppliedOnDate} is a date represented in UTC milliseconds 
   * since the epoch mapped to a {@code Recommendation} object representing 
   * the IAM Bindings recommendation that was applied on that date.
   */
  public static ProjectGraphData create(String projectId, 
    Map<Long, Integer> numberIAMBindingsOnDate, 
    Map<Long, Recommendation> recommendationsAppliedOnDate) {
    return new AutoValue_ProjectGraphData(projectId, numberIAMBindingsOnDate, 
      recommendationsAppliedOnDate);
  }

}
