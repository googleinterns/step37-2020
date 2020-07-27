package com.google.impactdashboard.data;

import java.util.Comparator;

import com.google.auto.value.AutoValue;

/** Represents a single row of the IAM Bindings table. */
@AutoValue
public abstract class IAMBindingDatabaseEntry {

  public abstract String getProjectId();
  public abstract String getProjectName();
  public abstract String getProjectNumber();
  public abstract long getTimestamp();
  public abstract int getBindingsNumber();

  /** 
   *  Creates a {@code IAMBindingDatabaseEntry} object for project {@code projectId}, 
   *  recording that there were {@code numberBindings} IAM Bindings for this project 
   *  at time {@code timestamp}.  
   */
  public static IAMBindingDatabaseEntry create(String projectId, String projectName, 
    String projectNumber, long timestamp, int bindingsNumber) {
    return new AutoValue_IAMBindingDatabaseEntry(projectId, projectName, 
      projectNumber, timestamp, bindingsNumber);
  }
}
