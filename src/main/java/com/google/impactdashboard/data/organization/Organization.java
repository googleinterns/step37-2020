package com.google.impactdashboard.data.organization;

import com.google.auto.value.AutoValue;

/** A class that represents an organization. */
@AutoValue
public abstract class Organization {

  public abstract OrganizationIdentification getIdentification();
  public abstract double getAverageBindings();

  /** 
   *  Creates a {@code Organization} object for an organization with identifying
   * information {@code identification} and average bindings {@code averageBindings}.
   */
  public static Organization create(OrganizationIdentification identification, 
      double averageBindings) {
    return new AutoValue_Organization(identification, averageBindings);
  }
  
}
