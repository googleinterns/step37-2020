package com.google.impactdashboard.data.organization;

import com.google.auto.value.AutoValue;

/** A class that representsthe identifying information for an organization. */
@AutoValue
public abstract class OrganizationIdentification {

  public abstract String getName();
  public abstract String getId();

  /** 
   *  Creates a {@code OrganizationIdentification} object for an organization with name 
   *  {@code name} and id {@code id}.
   */
  public static OrganizationIdentification create(String name, String id) {
    return new AutoValue_OrganizationIdentification(name, id);
  }
  
}
