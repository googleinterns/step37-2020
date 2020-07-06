package com.google.impactdashboard.data.project;

import com.google.auto.value.AutoValue;

/** Represents a project. */
@AutoValue
public abstract class Project {

  public abstract ProjectIdentification getIdentification();
  public abstract ProjectMetaData getMetaData();

  /** 
   *  Creates a {@code ProjectSummary} that has identifying information (i.e. 
   *  name, id, and number) wrapped in {@code identification}, and contains metadata 
   *  {@code metaData}.
   */
  public static Project create(ProjectIdentification identification, ProjectMetaData metaData) {
    return new AutoValue_Project(identification, metaData);
  }
}
