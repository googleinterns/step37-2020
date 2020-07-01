package com.google.impactdashboard.server;

import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.project.ProjectMetaData;

import java.util.ArrayList;
import java.util.List;

/** Retrieves all the information about the projects in the database */
public class ProjectInformationRetriever {
  private DataReadManager readManager;

  public ProjectInformationRetriever(DataReadManager readManager) {
    this.readManager = readManager;
  }

  /**
   * Retrieves information about projects from database and compiles them into list of
   * {@code Project}.
   * @return List of {@code Projects} from database
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
   * @return whether {@param projectIdentificationList} is up to date or not.
   */
  private boolean checkNewProjects(List<ProjectIdentification> projectIdentificationList) {
    throw new UnsupportedOperationException("Not Implemented");
  }

}
