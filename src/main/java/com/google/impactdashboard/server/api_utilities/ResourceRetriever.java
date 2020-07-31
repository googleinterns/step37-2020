package com.google.impactdashboard.server.api_utilities;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.cloudresourcemanager.CloudResourceManager;
import com.google.api.services.cloudresourcemanager.model.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.*;

import com.google.auth.http.HttpCredentialsAdapter;
import com.google.impactdashboard.Credentials;

import  com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.common.annotations.VisibleForTesting;

/** 
 * A class for using the Cloud Resource Manager API to retrieve the projects 
 * that the credentials in use have resourcemanager.projects.get permission for. 
 */
public class ResourceRetriever {

  private CloudResourceManager cloudResourceManagerService = null;
  private static ResourceRetriever INSTANCE = null;

  public static ResourceRetriever getInstance() {
    if (INSTANCE == null) {
      INSTANCE = new ResourceRetriever(createCloudResourceManagerService());
    }
    return INSTANCE;
  }

  protected ResourceRetriever(CloudResourceManager cloudResourceManagerService) {
    this.cloudResourceManagerService = cloudResourceManagerService;
  }

  /** 
   * Returns the list of projects that the credentials in use have 
   * resourcemanager.projects.get permissions for.  
   */
  public List<ProjectIdentification> listResourceManagerProjects() {
    try {
      CloudResourceManager.Projects.List request = cloudResourceManagerService.projects().list();
      return getListOfProjects(request);
    } catch (IOException io) {
      throw new RuntimeException("Failed to list projects: " + io.getMessage());
    }
  }

  @VisibleForTesting
  /** Returns the list of projects resulting from executing {@code request}. */
  protected static List<ProjectIdentification> getListOfProjects(
    CloudResourceManager.Projects.List request) throws IOException {
    List<ProjectIdentification> projects = new ArrayList<>();

    ListProjectsResponse response;
    do {
      response = request.execute();
      if (response.getProjects() != null) {
        response.getProjects().stream().forEach(project -> {
          String projectName = project.getName();
            if(projectName == null) {
              projectName = project.getProjectId();
            }
          projects.add(
            ProjectIdentification.create(
              projectName, project.getProjectId(), project.getProjectNumber()));
          });
      }
      request.setPageToken(response.getNextPageToken());
    } while (response.getNextPageToken() != null);

    return projects;
  }

  /**
   * Returns the top level ancestor to a project which is the organization the project belongs under.
   * @param projectId the project the organization id is being retrieved for.
   */
  public String getOrganizationId(String projectId){
    List<Ancestor> ancestors;
    try {
       ancestors = getProjectAncestry(projectId);
    } catch (IOException io) {
      throw new RuntimeException("Failed to get ancestors: " + io.getMessage());
    }
    if(ancestors == null) {
      return "";
    }
    return ancestors.get(ancestors.size()-1).getResourceId().getId();
  }

  /**
   * Returns the ancestor hierarchy for the specified project.
   * @param projectId the project to get the ancestors for
   */
  private List<Ancestor> getProjectAncestry(String projectId) throws IOException {
    CloudResourceManager.Projects.GetAncestry ancestry = cloudResourceManagerService.
        projects().getAncestry(projectId, new GetAncestryRequest());
    GetAncestryResponse response = ancestry.execute();
    return response.getAncestor();
  }

  /**
   * Returns the name of the organization that has the id specified.
   * @param organizationId The id of the organization the name is retrieved for.
   */
  public String getOrganizationName(String organizationId) {
    Organization organization;
    try {
      organization = searchOrganizationIds(organizationId);
    } catch (IOException io) {
      throw new RuntimeException("Could not find any organization with id:" + organizationId);
    }
    return organization != null ? organization.getDisplayName(): "";
  }

  /**
   * Searches through all the organizations to find the org that matches the id specified.
   * @param organizationId The id of the organization that is being searched for.
   * @return The organization that has the id specified, null if it does not exist.
   */
  private Organization searchOrganizationIds(String organizationId) throws IOException {
    SearchOrganizationsRequest request = new SearchOrganizationsRequest();
    CloudResourceManager.Organizations.Search search = cloudResourceManagerService.organizations()
        .search(request);

    SearchOrganizationsResponse response;
    do {
      response = search.execute();
      if(response.getOrganizations() != null) {
         Optional<Organization> optionalOrganization = response.getOrganizations().stream()
             .filter(organization -> Objects.equals(organization.getName(),
                 "organizations/" + organizationId)).findFirst();
         if (optionalOrganization.isPresent()) {
           return optionalOrganization.get();
         }
      }
      request.setPageToken(response.getNextPageToken());
    } while(response.getNextPageToken() != null);
    return null;
  }

  /**
   * Returns a CloudResourceManager with the proper credentials to retrieve the 
   * list of projects that the dashboard has access to.
   */
  private static CloudResourceManager createCloudResourceManagerService() {
    HttpTransport httpTransport = null;
    try {
      httpTransport = GoogleNetHttpTransport.newTrustedTransport();
    } catch (IOException io) {
      throw new RuntimeException(
        "Failed to access Resource Manager: could not create HttpTransport, " + io.getMessage());
    } catch (GeneralSecurityException ge) {
      throw new RuntimeException(
        "Failed to access Resource Manager: could not create HttpTransport, " + ge.getMessage());
    }
    JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();

    HttpCredentialsAdapter credentials = new HttpCredentialsAdapter(
      Credentials.getCredentials()
        .createScoped(Arrays.asList("https://www.googleapis.com/auth/cloud-platform")));

    return new CloudResourceManager.Builder(httpTransport, jsonFactory, credentials)
      .setApplicationName("Recommendations Impact Dashboard")
      .build();
  }

  public static void main(String[] args) {
    ResourceRetriever retriever = ResourceRetriever.getInstance();
    String name = retriever.getOrganizationName("766157370734");
  }
}
