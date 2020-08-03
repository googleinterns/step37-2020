package com.google.impactdashboard.data.organization;

import java.util.Map;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.auto.value.AutoValue;

/** The data necessary to graph a single organization. */
@AutoValue
public abstract class OrganizationGraphData {

  public abstract OrganizationIdentification getOrganizationIdentification();
  public abstract Map<Long, Integer> getDatesToBindings();
  public abstract Map<Long, Recommendation> getDatesToRecommendations();

  /** 
   * Create an {@code OrganizationGraphData} object for organization with identifying
   * information  {@code organizationIdentification}, where the mapping of
   * {@code datesToBindings} maps a date represented in UTC milliseconds 
   * since the epoch mapped to the number of IAM Bindings on that date, and a mapping 
   * in {@code datesToRecommendations} is a date represented in UTC milliseconds 
   * since the epoch mapped to a {@code Recommendation} object representing 
   * the IAM Bindings recommendation that was applied on that date.
   */
  public static OrganizationGraphData create(OrganizationIdentification organizationIdentification, 
    Map<Long, Integer> datesToBindings, 
    Map<Long, Recommendation> datesToRecommendations) {
    return new AutoValue_OrganizationGraphData(organizationIdentification, datesToBindings, datesToRecommendations);
  }

}
