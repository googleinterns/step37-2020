package com.google.impactdashboard.server;

import com.google.common.annotations.VisibleForTesting;
import com.google.impactdashboard.data.organization.OrganizationGraphData;
import com.google.impactdashboard.data.project.ProjectGraphData;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import com.google.impactdashboard.database_manager.data_read.DataReadManagerFactory;

import java.util.Map;

/** Retrieves all the information about the organizations in the database. */
public class OrganizationInformationRetriever {
  private final DataReadManager readManager;

  /**
   * Static factory for creating a OrganizationInformationRetriever with a new instance of DataReadManager.
   * @return New instance of OrganizationInformationRetriever
   */
  public static OrganizationInformationRetriever create() {
    return new OrganizationInformationRetriever(DataReadManagerFactory.create());
  }

  @VisibleForTesting
  protected OrganizationInformationRetriever(DataReadManager readManager) {
    this.readManager = readManager;
  }

  /**
   * Gets the information about the Organization specified by the organizationId from the database.
   * @param organizationId The id of the Organization the data is being retrieved from
   * @return The OrganizationGraphData from the organizationId that was specified
   */
  public OrganizationGraphData getOrganizationData(String organizationId) {
    Map<Long, Integer> numberIAMBindingsOnDate =
        readManager.getOrganizationDatesToBindings(organizationId);
    Map<Long, Recommendation> recommendationsAppliedOnDate =
        readManager.getOrganizationDatesToRecommendations(organizationId);
    return OrganizationGraphData.create(organizationId, numberIAMBindingsOnDate,
        recommendationsAppliedOnDate);
  }
}
