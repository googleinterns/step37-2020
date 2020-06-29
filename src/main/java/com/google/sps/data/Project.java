package com.google.sps.data;

/** Represents a project. */
public class Project {

  public String name;
  public String id;
  public String projectNumber;
  public ProjectMetaData metaData;

  /** 
   * Creates a {@code ProjectSummary} that hase name {@code name}, project id 
   * {@code id}, project number {@code projectNumber}, and contains metadata 
   * {@code metaData}.
   */
  public Project(String name, String id, String projectNumber, ProjectMetaData metaData) {
    this.name = name;
    this.id = id;
    this.projectNumber = projectNumber;
    this.metaData = metaData;
  }
}
