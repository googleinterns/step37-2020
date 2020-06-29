package com.google.sps.data;

/** Represents the identifying information of a single project. */
public class ProjectIdentification {

  public String name;
  public String projectId;
  public long projectNumber;

  /** 
   *  Creates a {@code projectIdentification} object for a project with name 
   *  {@code name}, id {@code projectId}, and number {@code projectNumber}. 
   */
  public ProjectIdentification(String name, String projectId, long projectNumber) {
    this.name = name;
    this.projectId = projectId;
    this.projectNumber = projectNumber;
  }
}
