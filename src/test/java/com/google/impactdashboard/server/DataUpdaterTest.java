package com.google.impactdashboard.server;

import java.util.ArrayList;
import java.util.Arrays;

import com.google.cloud.logging.v2.LoggingClient;
import com.google.logging.v2.LogEntry;
import com.google.cloud.logging.v2.LoggingClient.ListLogEntriesPagedResponse;
import com.google.impactdashboard.configuration.Configuration;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.IAMRecommenderMetadata;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.data.recommendation.RecommendationAction;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import com.google.impactdashboard.database_manager.data_read.DataReadManagerFactory;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManager;
import com.google.impactdashboard.database_manager.data_update.DataUpdateManagerFactory;
import com.google.impactdashboard.server.api_utilities.IamBindingRetriever;
import com.google.impactdashboard.server.api_utilities.LogRetriever;
import com.google.impactdashboard.server.api_utilities.ProjectListRetriever;
import com.google.impactdashboard.server.api_utilities.RecommendationRetriever;

import com.google.logging.v2.LogEntry;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

import java.util.Collections;
import java.util.List;

@RunWith(JUnit4.class)
public class DataUpdaterTest extends Mockito {

  public static final List<IAMBindingDatabaseEntry> PROJECT_3_IAM_BINDING_SINGLE_ENTRY =
      Collections.singletonList(IAMBindingDatabaseEntry.create("project-id-3",
          "project-id-3", "345678901234",0L, 1000));
  public static final List<IAMBindingDatabaseEntry> PROJECT_1_IAM_BINDING_SINGLE_ENTRY =
      Collections.singletonList(IAMBindingDatabaseEntry.create("project-id-1",
          "project-id-1", "123456789123",1595131200000L, 13456));
  public static final List<IAMBindingDatabaseEntry> PROJECT_2_IAM_BINDING_SINGLE_ENTRY =
      Collections.singletonList(IAMBindingDatabaseEntry.create("project-id-2",
          "project-id-2", "234567890123",1595131200000L, 23454));

  private LogRetriever mockLogRetriever;
  private RecommendationRetriever mockRecommendationRetriever;
  private DataUpdateManager fakeDataUpdateManager;
  private DataReadManager fakeDataReadManager;
  private IamBindingRetriever mockIamBindingRetriever;
  private ProjectListRetriever mockProjectListRetriever;
  private DataUpdater manualDataUpdater;
  private DataUpdater automaticDataUpdater;

  private static final ProjectIdentification PROJECT_1 =
  private ListLogEntriesPagedResponse project3RecommendationResponse;
  private ListLogEntriesPagedResponse project3RecommendationResponseManual;
  private ListLogEntriesPagedResponse project2RecommendationResponse;
  private ListLogEntriesPagedResponse project1RecommendationResponse;

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

    initializeRecommendationFakes();
  }


  @Test
  public void testAutomaticUpdateRecommendationsWith1NewProject2Old() {
    LoggingClient.ListLogEntriesPagedResponse project3Response =
        mock(LoggingClient.ListLogEntriesPagedResponse.class);
    LoggingClient.ListLogEntriesPagedResponse project2Response =
        mock(LoggingClient.ListLogEntriesPagedResponse.class);
    LoggingClient.ListLogEntriesPagedResponse project1Response =
        mock(LoggingClient.ListLogEntriesPagedResponse.class);
    List<LogEntry> project3RecommendationLogs =
  /** Sets up all mock object behavior necessary for Recommendations tests. */
  private void initializeRecommendationFakes() {
    project3RecommendationResponse = mock(ListLogEntriesPagedResponse.class);
    project3RecommendationResponseManual = mock(ListLogEntriesPagedResponse.class);
    project2RecommendationResponse = mock(ListLogEntriesPagedResponse.class);
    project1RecommendationResponse = mock(ListLogEntriesPagedResponse.class);

    List<LogEntry> project3RecommendationLogs =
        Arrays.asList(mock(LogEntry.class), mock(LogEntry.class));
    List<LogEntry> project1RecommendationLogs =
        Arrays.asList(mock(LogEntry.class));
    List<Recommendation> project3Recommendations =
    List<LogEntry> project3RecommendationLogsManual = Arrays.asList(mock(LogEntry.class));
    List<LogEntry> project1RecommendationLogs = Arrays.asList(mock(LogEntry.class));
    List<Recommendation> project3Recommendations =
        Arrays.asList(PROJECT_3_RECOMMENDATION_1, PROJECT_3_RECOMMENDATION_2);
    List<Recommendation> project1Recommendations =
        Arrays.asList(PROJECT_1_RECOMMENDATION);

    when(mockProjectListRetriever.listResourceManagerProjects())
        .thenReturn(new ArrayList<>(Arrays.asList(PROJECT_1, PROJECT_2, PROJECT_3)));
    List<Recommendation> project3RecommendationsManual =
        Arrays.asList(PROJECT_3_RECOMMENDATION_1);
    List<Recommendation> project1Recommendations =
        Arrays.asList(PROJECT_1_RECOMMENDATION);

    when(mockLogRetriever.listRecommendationLogs(PROJECT_3.getProjectId(), "", ""))
        .thenReturn(project3RecommendationResponse);
    when(
        mockLogRetriever.listRecommendationLogs(
            eq(PROJECT_3.getProjectId()), eq(""), argThat(time -> !time.equals(""))))
        .thenReturn(project3RecommendationResponseManual);
    when(mockLogRetriever.listRecommendationLogs(
            eq(PROJECT_1.getProjectId()), argThat(time -> !time.equals("")), eq("")))
        .thenReturn(project1RecommendationResponse);
    when(mockLogRetriever.listRecommendationLogs(
            eq(PROJECT_2.getProjectId()), argThat(time -> !time.equals("")), eq("")))
        .thenReturn(project2RecommendationResponse);

    when(project1RecommendationResponse.iterateAll()).thenReturn(project1RecommendationLogs);
    when(project3RecommendationResponse.iterateAll()).thenReturn(project3RecommendationLogs);
    when(project3RecommendationResponseManual.iterateAll())
        .thenReturn(project3RecommendationLogsManual);
    when(project2RecommendationResponse.iterateAll()).thenReturn(Arrays.asList());

    when(
        mockRecommendationRetriever.listRecommendations(
            project3RecommendationLogs, PROJECT_3.getProjectId(),
            Recommendation.RecommenderType.IAM_BINDING, mockIamBindingRetriever))
        .thenReturn(project3Recommendations);
    when(
        mockRecommendationRetriever.listRecommendations(
            project1RecommendationLogs, PROJECT_1.getProjectId(),
            project3RecommendationLogsManual, PROJECT_3.getProjectId(),
            Recommendation.RecommenderType.IAM_BINDING, mockIamBindingRetriever))
        .thenReturn(project3RecommendationsManual);
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

    when(mockProjectListRetriever.listResourceManagerProjects())
        .thenReturn(new ArrayList<>(Arrays.asList(PROJECT_1, PROJECT_2, PROJECT_3)));
  }

  @Test
  public void testAutomaticUpdateRecommendationsWith1NewProject2Old() {
    List<Recommendation> actual = automaticDataUpdater.listUpdatedRecommendations();
    List<Recommendation> expected = Arrays.asList(
        PROJECT_1_RECOMMENDATION, PROJECT_3_RECOMMENDATION_1, PROJECT_3_RECOMMENDATION_2);


    Assert.assertEquals("Returned lists have the same size", expected.size(), actual.size());
    actual.removeAll(expected); // if actual is now empty, the lists were equal
    Assert.assertEquals("Lists are equal", Arrays.asList(), actual);
  }

  @Test
  public void testManualUpdateRecommendations() {
    List<Recommendation> actual = manualDataUpdater.listUpdatedRecommendations();
    List<Recommendation> expected = Arrays.asList(PROJECT_3_RECOMMENDATION_1);

    Assert.assertEquals("Returned lists have the same size", expected.size(), actual.size());
    actual.removeAll(expected); // if actual is now empty, the lists were equal
    Assert.assertEquals("Lists are equal", Arrays.asList(), actual);
  }

  @Test
  public void manualIAMUpdate1NewProject1OldProject() {
    // Testing the functionality for manually updating a new project,
    // Old projects are ignored in this case so nothing should be changed
    // for them.

    LoggingClient.ListLogEntriesPagedResponse project3Response =
        mock(LoggingClient.ListLogEntriesPagedResponse.class, Mockito.RETURNS_DEEP_STUBS);

    List<LogEntry> project3AuditLogs =
        Collections.singletonList(mock(LogEntry.class));

    when(mockProjectListRetriever.listResourceManagerProjects())
        .thenReturn(new ArrayList<>(Arrays.asList(PROJECT_1, PROJECT_3)));

    when(mockLogRetriever.listAuditLogsResponse(eq(PROJECT_3.getProjectId()), anyString(),
        anyString(), anyInt())).thenReturn(project3Response);

    when(project3Response.iterateAll()).thenReturn(project3AuditLogs);

    when(project3Response.getPage().getResponse().getEntriesList())
        .thenReturn(project3AuditLogs);

    when(mockIamBindingRetriever.listIAMBindingData(any(), any(), any(),
        any(), any())).thenReturn(PROJECT_3_IAM_BINDING_SINGLE_ENTRY);

    List<IAMBindingDatabaseEntry> actual = manualDataUpdater.listUpdatedIAMBindingData();
    // Testing size because should always return 30 long List and creating the expected list would be too large
    int expectedSize = 30;
    Assert.assertEquals(expectedSize, actual.size());

    // Testing to see if the bindings are the correct ammount
    IAMBindingDatabaseEntry actualEntry = actual.get(15);
    int expectedBindingsNumber = 1000;
    Assert.assertEquals(expectedBindingsNumber, actualEntry.getBindingsNumber());
  }

  @Test
  public void automaticIAMUpdate1NewProject2OldProject() {
    // Testing the automatic updating for both new and old projects.
    // 31 logs for New projects, 1 log for old projects

    LoggingClient.ListLogEntriesPagedResponse project3Response =
        mock(LoggingClient.ListLogEntriesPagedResponse.class, Mockito.RETURNS_DEEP_STUBS);
    LoggingClient.ListLogEntriesPagedResponse project2Response =
        mock(LoggingClient.ListLogEntriesPagedResponse.class, Mockito.RETURNS_DEEP_STUBS);
    LoggingClient.ListLogEntriesPagedResponse project1Response =
        mock(LoggingClient.ListLogEntriesPagedResponse.class, Mockito.RETURNS_DEEP_STUBS);
    List<LogEntry> project3AuditLogs =
        Collections.singletonList(mock(LogEntry.class));
    List<LogEntry> project2AuditLogs =
        Collections.singletonList(mock(LogEntry.class));
    List<LogEntry> project1AuditLogs =
        Collections.singletonList(mock(LogEntry.class));

    when(mockProjectListRetriever.listResourceManagerProjects())
        .thenReturn(new ArrayList<>(Arrays.asList(PROJECT_1, PROJECT_2, PROJECT_3)));

    when(mockLogRetriever.listAuditLogsResponse(eq(PROJECT_3.getProjectId()), anyString(),
        anyString(), anyInt())).thenReturn(project3Response);

    when(mockLogRetriever.listAuditLogsResponse(eq(PROJECT_2.getProjectId()), anyString(),
        anyString(), anyInt())).thenReturn(project2Response);

    when(mockLogRetriever.listAuditLogsResponse(eq(PROJECT_1.getProjectId()), anyString(),
        anyString(), anyInt())).thenReturn(project1Response);

    when(project3Response.iterateAll()).thenReturn(project3AuditLogs);

    when(project3Response.getPage().getResponse().getEntriesList())
        .thenReturn(project3AuditLogs);

    when(project2Response.iterateAll()).thenReturn(project2AuditLogs);

    when(project2Response.getPage().getResponse().getEntriesList())
        .thenReturn(project2AuditLogs);

    when(project1Response.iterateAll()).thenReturn(project1AuditLogs);

    when(project1Response.getPage().getResponse().getEntriesList())
        .thenReturn(project1AuditLogs);

    when(mockIamBindingRetriever.listIAMBindingData(any(), eq(PROJECT_3.getProjectId()), any(),
        any(), any())).thenReturn(PROJECT_3_IAM_BINDING_SINGLE_ENTRY);

    when(mockIamBindingRetriever.listIAMBindingData(any(), eq(PROJECT_2.getProjectId()), any(),
        any(), any())).thenReturn(PROJECT_2_IAM_BINDING_SINGLE_ENTRY);

    when(mockIamBindingRetriever.listIAMBindingData(any(), eq(PROJECT_1.getProjectId()), any(),
        any(), any())).thenReturn(PROJECT_1_IAM_BINDING_SINGLE_ENTRY);

    List<IAMBindingDatabaseEntry> actual = automaticDataUpdater.listUpdatedIAMBindingData();
    // Testing size because should always return 30 long List and creating the expected list would be too large
    int expectedSize = 33;
    Assert.assertEquals(expectedSize, actual.size());

    // Testing to see if the bindings are the correct amount for the new project
    IAMBindingDatabaseEntry actualEntryProject3 = actual.get(0);
    int expectedBindingsNumberNewProject = 1000;
    String expectedProjectId = PROJECT_3.getProjectId();
    Assert.assertEquals(expectedBindingsNumberNewProject, actualEntryProject3.getBindingsNumber());
    Assert.assertEquals(expectedProjectId, actualEntryProject3.getProjectId());

    // Testing if the entry is correct for first old project
    IAMBindingDatabaseEntry actualEntryOldProject1 = actual.get(31);
    int expectedBindingsNumberOldProject1 = 13456;
    expectedProjectId = PROJECT_1.getProjectId();
    Assert.assertEquals(expectedBindingsNumberOldProject1, actualEntryOldProject1
        .getBindingsNumber());
    Assert.assertEquals(expectedProjectId, actualEntryOldProject1.getProjectId());

    // Testing if the entry is correct for the second  old project
    IAMBindingDatabaseEntry actualEntryOldProject2 = actual.get(32);
    int expectedBindingsNumberOldProject2 = 23454;
    expectedProjectId = PROJECT_2.getProjectId();
    Assert.assertEquals(expectedBindingsNumberOldProject2, actualEntryOldProject2
        .getBindingsNumber());
    Assert.assertEquals(expectedProjectId, actualEntryOldProject2.getProjectId());
  }

}
