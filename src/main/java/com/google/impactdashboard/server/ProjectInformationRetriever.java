package com.google.impactdashboard.server;

import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.project.ProjectMetaData;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import com.google.impactdashboard.database_manager.data_read.DataReadManagerFactory;

import java.util.ArrayList;
import java.util.List;

/** Retrieves all the information about the projects in the database */
public class ProjectInformationRetriever {
  private DataReadManager readManager;

  /**
   * Static factory for creating a ProjectInformationRetriever with a new instance of DataReadManager.
   * @return New instance of ProjectInformationRetriever
   */
  public static ProjectInformationRetriever create() {
    return new ProjectInformationRetriever(DataReadManagerFactory.create());
  }

  /**
   * Static factory for creating a ProjectInformationRetriever with a premade instance of DataReadManager.
   * @return New instance of ProjectInformationRetriever
   */
  public static ProjectInformationRetriever create(DataReadManager readManger) {
    return new ProjectInformationRetriever(readManger);
  }

  private ProjectInformationRetriever(DataReadManager readManager) {
    this.readManager = readManager;
  }

  /**
   * Retrieves information about projects from database and compiles them into list of
   * Project.
   * @return List of Projects from database
   */
  public List<Project> listProjectInformation() {
    List<Project> projectList = new ArrayList<>();
    List<ProjectIdentification> projectIdentificationList = readManager.listProjects();
    projectIdentificationList.forEach( projectIdentification -> {
      ProjectMetaData projectMetadata = ProjectMetaData.create(readManager.
          getAverageIAMBindingsInPastYear(projectIdentification.getProjectId()));
      Project project = Project.create(projectIdentification.getName(),
          projectIdentification.getProjectId(), projectIdentification.getProjectNumber(),
          projectMetadata);
      projectList.add(project);
    });
    return projectList;
  }

  /**
   * Checks to see if there are new projects that were created after the database last updated
   * @param projectIdentificationList List of project Identification that the database is storing
   * @return whether {@code projectIdentificationList} is up to date or not.
   */
  private boolean checkNewProjects(List<ProjectIdentification> projectIdentificationList) {
    throw new UnsupportedOperationException("Not Implemented");
  }

}
