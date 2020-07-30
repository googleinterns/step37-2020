package com.google.impactdashboard.server.api_utilities;

import com.google.api.services.cloudresourcemanager.CloudResourceManager;
import com.google.api.services.cloudresourcemanager.model.ListProjectsResponse;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.api.services.cloudresourcemanager.model.Project;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

import java.io.IOException;
import java.util.*;

@RunWith(JUnit4.class)
public class ProjectListRetrieverTest extends Mockito {

  private CloudResourceManager.Projects.List mockRequest;
  private ListProjectsResponse mockResponse;
  private Project project1;
  private Project project2;

  private static final ProjectIdentification PROJECT_1_ID = ProjectIdentification.create(
    "project 1", "project-id-1", 123456789123L);
  private static final ProjectIdentification PROJECT_2_ID = ProjectIdentification.create(
    "project 2", "project-id-2", 234567890123L);

  @Before
  public void setup() {
    mockRequest = mock(CloudResourceManager.Projects.List.class);
    mockResponse = mock(ListProjectsResponse.class);
    project1 = new Project().setName("project 1")
      .setProjectNumber(123456789123L)
      .setProjectId("project-id-1");
    project2 = new Project().setName("project 2")
      .setProjectNumber(234567890123L)
      .setProjectId("project-id-2");
  }

  @Test
  public void testBothProjectsExtractedCorrectly() throws IOException {
    when(mockRequest.execute()).thenReturn(mockResponse);
    when(mockResponse.getProjects()).thenReturn(Arrays.asList(project1, project2));
    when(mockResponse.getNextPageToken()).thenReturn(null);

    List<ProjectIdentification> actual = ProjectListRetriever.getListOfProjects(mockRequest);
    List<ProjectIdentification> expected = Arrays.asList(PROJECT_1_ID, PROJECT_2_ID);

    Assert.assertEquals(expected.size(), actual.size());
    actual.removeAll(expected); // should be empty if lists are equal
    Assert.assertEquals(Arrays.asList(), actual);
  }

  @Test
  public void testNoProjects() throws IOException {
    when(mockRequest.execute()).thenReturn(mockResponse);
    when(mockResponse.getProjects()).thenReturn(null);
    when(mockResponse.getNextPageToken()).thenReturn(null);

    List<ProjectIdentification> actual = ProjectListRetriever.getListOfProjects(mockRequest);

    Assert.assertEquals(Arrays.asList(), actual);
  }
}
