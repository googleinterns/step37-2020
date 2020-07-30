package com.google.impactdashboard.data.project;

import com.google.auto.value.AutoValue;

/** Represents a project. */
@AutoValue
public abstract class Project {

  public abstract String getName();
  public abstract String getProjectId();
  public abstract long getProjectNumber();
  public abstract ProjectMetaData getMetaData();

  /**
   *  Creates a {@code ProjectSummary} that has identifying information (i.e.
   *  name, id, and number) wrapped in {@code identification}, and contains metadata
   *  {@code metaData}.
   */
  public static Project create(String name, String projectId, long projectNumber,
                               ProjectMetaData metaData) {
    return new AutoValue_Project(name, projectId, projectNumber, metaData);
  }
}
