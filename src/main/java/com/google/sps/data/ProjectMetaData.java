package com.google.sps.data;

/** Metadata for an individual project. */
public class ProjectMetaData {

  public float averageIAMBindingsInPastYear;

  /** 
   *  Create metadata that speicfy that this project had an average of
   *  {@code averageIAmBindingsInPastYear} IAM Bindings per day in the past 
   *  year. 
   */
  public ProjectMetaData(float averageIAMBindingsInPastYear) {
    this.averageIAMBindingsInPastYear = averageIAMBindingsInPastYear;
  }
}
