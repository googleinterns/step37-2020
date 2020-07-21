package com.google.impactdashboard.server;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.google.apphosting.api.logservice.LogServicePb.LogReadRequest;
import com.google.logging.v2.LogEntry;
import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
import com.google.impactdashboard.configuration.Configuration;
import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.data.project.ProjectGraphData;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.project.ProjectMetaData;
import com.google.impactdashboard.data.recommendation.IAMRecommenderMetadata;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.data.recommendation.RecommendationAction;
import com.google.impactdashboard.data.recommendation.Recommendation.RecommenderType;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import com.google.impactdashboard.database_manager.data_read.DataReadManagerFactory;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManager;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManagerFactory;
import com.google.impactdashboard.server.api_utilities.IamBindingRetriever;
import com.google.impactdashboard.server.api_utilities.LogRetriever;
import com.google.impactdashboard.server.api_utilities.ProjectListRetriever;
import com.google.impactdashboard.server.api_utilities.RecommendationRetriever;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

@RunWith(JUnit4.class)
public class DataUpdaterTest extends Mockito {
  private LogRetriever mockLogRetriever;
  private RecommendationRetriever mockRecommendationRetriever;
  private DataUpdateManager fakeDataUpdateManager;
  private DataReadManager fakeDataReadManager;
  private IamBindingRetriever mockIamBindingRetriever;
  private ProjectListRetriever mockProjectListRetriever;
  private DataUpdater manualDataUpdater;
  private DataUpdater automaticDataUpdater;

  private static final ProjectIdentification PROJECT_1 = 
      ProjectIdentification.create("project-1", "project-id-1", 123456789123L);
  private static final ProjectIdentification PROJECT_2 = 
      ProjectIdentification.create("project-2", "project-id-2", 234567890123L);
  private static final ProjectIdentification PROJECT_3 = 
      ProjectIdentification.create("project-3", "project-id-3", 345678901234L);
  private static final Recommendation PROJECT_3_RECOMMENDATION_1 = 
      Recommendation.create("project-id-3", "test@example.com", 
          Arrays.asList(
            RecommendationAction.create(
              "affected@example.com", "role1", "",
              RecommendationAction.ActionType.REMOVE_ROLE)), 
          Recommendation.RecommenderType.IAM_BINDING, 1593072412000L, 
          IAMRecommenderMetadata.create(350));
  private static final Recommendation PROJECT_3_RECOMMENDATION_2 = 
      Recommendation.create("project-id-3", "test@example.com", 
          Arrays.asList(
            RecommendationAction.create(
              "affected@example.com", "role1", "role2",
              RecommendationAction.ActionType.REPLACE_ROLE)), 
          Recommendation.RecommenderType.IAM_BINDING, 1593070012000L, 
          IAMRecommenderMetadata.create(400));
  private static final Recommendation PROJECT_1_RECOMMENDATION = 
      Recommendation.create("project-id-1", "test@example.com", 
          Arrays.asList(
            RecommendationAction.create(
              "affected@example.com", "role1", "",
              RecommendationAction.ActionType.REMOVE_ROLE)), 
          Recommendation.RecommenderType.IAM_BINDING, 1593078012000L, 
          IAMRecommenderMetadata.create(1000));

  @Before
  public void setup() {
    Configuration.useFakeDataReadManager = true;
    Configuration.useFakeDataUpdateManager = true;
    fakeDataReadManager = DataReadManagerFactory.create();
    fakeDataUpdateManager = DataUpdateManagerFactory.create();
    Configuration.useFakeDataReadManager = false;
    Configuration.useFakeDataUpdateManager = false;

    mockLogRetriever = mock(LogRetriever.class);
    mockRecommendationRetriever = mock(RecommendationRetriever.class);
    mockIamBindingRetriever = mock(IamBindingRetriever.class);
    mockProjectListRetriever = mock(ProjectListRetriever.class);

    manualDataUpdater = new DataUpdater(
        mockLogRetriever, mockRecommendationRetriever, fakeDataUpdateManager, 
        fakeDataReadManager, mockIamBindingRetriever, mockProjectListRetriever, true);
    automaticDataUpdater = new DataUpdater(
        mockLogRetriever, mockRecommendationRetriever, fakeDataUpdateManager, 
        fakeDataReadManager, mockIamBindingRetriever, mockProjectListRetriever, false);
  }

  private void initializeRecommendationFakes() {

  }

  @Test
  public void testAutomaticUpdateRecommendationsWith1NewProject2Old() {
    ListLogEntriesPagedResponse project3Response = mock(ListLogEntriesPagedResponse.class);
    ListLogEntriesPagedResponse project2Response = mock(ListLogEntriesPagedResponse.class);
    ListLogEntriesPagedResponse project1Response = mock(ListLogEntriesPagedResponse.class);
    List<LogEntry> project3RecommendationLogs = 
        Arrays.asList(mock(LogEntry.class), mock(LogEntry.class));
    List<LogEntry> project1RecommendationLogs = 
        Arrays.asList(mock(LogEntry.class));
    List<Recommendation> project3Recommendations = 
        Arrays.asList(PROJECT_3_RECOMMENDATION_1, PROJECT_3_RECOMMENDATION_2);
    List<Recommendation> project1Recommendations = 
        Arrays.asList(PROJECT_1_RECOMMENDATION); 
    
    when(mockProjectListRetriever.listResourceManagerProjects())
        .thenReturn(new ArrayList<>(Arrays.asList(PROJECT_1, PROJECT_2, PROJECT_3)));
    when(mockLogRetriever.listRecommendationLogs(PROJECT_3.getProjectId(), "", ""))
        .thenReturn(project3Response);
    when(mockLogRetriever.listRecommendationLogs(
            eq(PROJECT_1.getProjectId()), argThat(time -> !time.equals("")), eq("")))
        .thenReturn(project1Response);
    when(mockLogRetriever.listRecommendationLogs(
            eq(PROJECT_2.getProjectId()), argThat(time -> !time.equals("")), eq("")))
        .thenReturn(project2Response);

    when(project1Response.iterateAll()).thenReturn(project1RecommendationLogs);
    when(project3Response.iterateAll()).thenReturn(project3RecommendationLogs);
    when(project2Response.iterateAll()).thenReturn(Arrays.asList());

    when(
        mockRecommendationRetriever.listRecommendations(
            project3RecommendationLogs, PROJECT_3.getProjectId(), 
            Recommendation.RecommenderType.IAM_BINDING, mockIamBindingRetriever))
        .thenReturn(project3Recommendations);
    when(
        mockRecommendationRetriever.listRecommendations(
            project1RecommendationLogs, PROJECT_1.getProjectId(), 
            Recommendation.RecommenderType.IAM_BINDING, mockIamBindingRetriever))
        .thenReturn(project1Recommendations);
    when(
        mockRecommendationRetriever.listRecommendations(
            Arrays.asList(), PROJECT_2.getProjectId(), 
            Recommendation.RecommenderType.IAM_BINDING, mockIamBindingRetriever))
        .thenReturn(Arrays.asList());

    List<Recommendation> actual = automaticDataUpdater.listUpdatedRecommendations();
    List<Recommendation> expected = Arrays.asList(
        PROJECT_1_RECOMMENDATION, PROJECT_3_RECOMMENDATION_1, PROJECT_3_RECOMMENDATION_2);
    
    Assert.assertEquals("Returned lists have the same size", expected.size(), actual.size());
    actual.removeAll(expected); // if actual is now empty, the lists were equal
    Assert.assertEquals("Lists are equal", Arrays.asList(), actual);
  }
}
