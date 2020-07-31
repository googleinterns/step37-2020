package com.google.impactdashboard.server;

import com.google.common.annotations.VisibleForTesting;
import com.google.impactdashboard.data.DataSummaryList;
import com.google.impactdashboard.data.organization.Organization;
import com.google.impactdashboard.data.organization.OrganizationIdentification;
import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.project.ProjectMetaData;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import com.google.impactdashboard.database_manager.data_read.DataReadManagerFactory;

import java.util.List;
import java.util.stream.Collectors;

public class DataSummaryRetriever {
  private final DataReadManager readManager;

  /**
   * Static factory for creating a DataSummaryRetriever with a new instance of DataReadManager.
   * @return New instance of DataSummaryRetriever
   */
  public static DataSummaryRetriever create() {
    return new DataSummaryRetriever(DataReadManagerFactory.create());
  }

  @VisibleForTesting
  protected DataSummaryRetriever(DataReadManager readManager) {
    this.readManager = readManager;
  }

  /**
   * Returns the summaries of the organization and project data stored in the data base;
   * @return DataSummaryList objects that contains the summaries for organization and projects.
   */
  public DataSummaryList getDataSummary() {
    return DataSummaryList.create(listProjectInformation(), listOrganizationInformation());
  }

  /**
   * Retrieves information about projects from database and compiles them into list of
   * Project.
   * @return List of Projects from database
   */
  private List<Project> listProjectInformation() {
    List<ProjectIdentification> projectIdentificationList = readManager.listProjects();
    return projectIdentificationList.stream().map(projectIdentification -> {
      ProjectMetaData projectMetadata = ProjectMetaData.create(readManager.
          getAverageIAMBindingsInPastYear(projectIdentification.getProjectId()));
      return Project.create(projectIdentification.getName(),
          projectIdentification.getProjectId(), projectIdentification.getProjectNumber(),
          projectMetadata);
    }).collect(Collectors.toList());
  }

  /**
   * Retrieves information about organizations from database and compiles them into list of
   * Project.
   * @return List of organizations from database
   */
  private List<Organization> listOrganizationInformation() {
    List<OrganizationIdentification> organizationIdentificationList = readManager.listOrganizations();
    return organizationIdentificationList.stream().map(organizationIdentification -> Organization
        .create(organizationIdentification, readManager.getOrganizationAvgBindingsInPastYear())
    ).collect(Collectors.toList());
  }
}
