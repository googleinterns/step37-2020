package com.google.sps.data;

/** Represents a single row of the IAM Bindings table. */
public class IAMBindingDatabaseEntry {

  public String projectId;
  public long timestamp;
  public int bindingsNumber;

  /** 
   *  Creates a {@code IAMBindingDatabaseEntry} object for project {@code projectId}, 
   *  recording that there were {@code numberBindings} IAM Bindings for this project 
   *  at time {@code timestamp}.  
   */
  public IAMBindingDatabaseEntry(String projectId, long timestamp, 
    int bindingsNumber) {
    this.projectId = projectId;
    this.timestamp = timestamp;
    this.bindingsNumber = bindingsNumber;
  }
}
