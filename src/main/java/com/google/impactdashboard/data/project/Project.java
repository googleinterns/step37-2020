package com.google.impactdashboard.data.project;

import com.google.impactdashboard.data.project.ProjectIdentification;

/** Represents a project. */
public class Project {

  public ProjectIdentification identification;
  public ProjectMetaData metaData;

  /** 
   *  Creates a {@code ProjectSummary} that has identifying information (i.e. 
   *  name, id, and number) wrapped in {@code identification}, and contains metadata 
   *  {@code metaData}.
   */
  public Project(ProjectIdentification identification, ProjectMetaData metaData) {
    this.identification = identification;
    this.metaData = metaData;
  }
}
