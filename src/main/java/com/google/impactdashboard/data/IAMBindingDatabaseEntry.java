package com.google.impactdashboard.data;

import java.util.Comparator;

import com.google.auto.value.AutoValue;
import com.google.impactdashboard.data.organization.OrganizationIdentification;

/** Represents a single row of the IAM Bindings table. */
@AutoValue
public abstract class IAMBindingDatabaseEntry {

  public abstract String getProjectId();
  public abstract String getProjectName();
  public abstract String getProjectNumber();
  public abstract OrganizationIdentification getIdentification();
  public abstract long getTimestamp();
  public abstract int getBindingsNumber();

  /** 
   *  Creates a {@code IAMBindingDatabaseEntry} object for project {@code projectId}, 
   *  recording that there were {@code numberBindings} IAM Bindings for this project 
   *  at time {@code timestamp}.  
   */
  public static IAMBindingDatabaseEntry create(String projectId, String projectName, 
    String projectNumber, OrganizationIdentification identification, long timestamp, 
    int bindingsNumber) {
    return new AutoValue_IAMBindingDatabaseEntry(projectId, projectName, 
      projectNumber, identification, timestamp, bindingsNumber);
  }
}
