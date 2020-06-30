package com.google.impactdashboard.data.project;

import com.google.auto.value.AutoValue;

/** Metadata for an individual project. */
@AutoValue
public abstract class ProjectMetaData {

  public abstract double getAverageIAMBindingsInPastYear();

  /** 
   *  Create metadata that speicfy that this project had an average of
   *  {@code averageIAmBindingsInPastYear} IAM Bindings per day in the past 
   *  year. 
   */
  public static ProjectMetaData create(double averageIAMBindingsInPastYear) {
    return new AutoValue_ProjectMetaData(averageIAMBindingsInPastYear);
  }
}
