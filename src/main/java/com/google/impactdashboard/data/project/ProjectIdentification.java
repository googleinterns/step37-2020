package com.google.impactdashboard.data.project;

import com.google.auto.value.AutoValue;

/** Represents the identifying information of a single project. */
@AutoValue
public abstract class ProjectIdentification {

  public abstract String getName();
  public abstract String getProjectId();
  public abstract long getProjectNumber();

  /** 
   *  Creates a {@code projectIdentification} object for a project with name 
   *  {@code name}, id {@code projectId}, and number {@code projectNumber}. 
   */
  public static ProjectIdentification create(String name, String projectId, long projectNumber) {
    return new AutoValue_ProjectIdentification(name, projectId, projectNumber);
  }
}
