package com.google.impactdashboard.server;

import com.google.apphosting.api.logservice.LogServicePb.LogReadRequest;
import com.google.cloud.logging.v2.LoggingClient;
import com.google.impactdashboard.configuration.Configuration;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.data.project.ProjectGraphData;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.project.ProjectMetaData;
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

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RunWith(JUnit4.class)
public class DataUpdaterTest extends Mockito {

  public static final List<IAMBindingDatabaseEntry> IAM_BINDING_SINGLE_ENTRY_WITHIN_30_DAYS =
      Collections.singletonList(IAMBindingDatabaseEntry.create("project-1",
          "project-1", "10",1594958400000L, 100000));
  public static final List<IAMBindingDatabaseEntry> IAM_BINDING_SINGLE_ENTRY_OUTSIDE_30_DAYS =
      Collections.singletonList(IAMBindingDatabaseEntry.create("project-1",
          "project-1", "10",1591675200000L, 1000));

  private LogRetriever mockLogRetriever;
  private RecommendationRetriever mockRecommendationRetriever;
  private DataUpdateManager fakeDataUpdateManager;
  private DataReadManager fakeDataReadManager;
  private IamBindingRetriever mockIamBindingRetriever;
  private ProjectListRetriever mockProjectListRetriever;
  private DataUpdater manualDataUpdater;
  private DataUpdater automaticDataUpdater;

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

  @Test
  public void manualIAMUpdateAllProjectsNeedUpdate() {
    LoggingClient.ListLogEntriesPagedResponse mockResponse =
        mock(LoggingClient.ListLogEntriesPagedResponse.class);
    when(StreamSupport.stream(mockResponse.iterateAll().spliterator(), false)
        .collect(Collectors.toList())).thenReturn(Collections.emptyList());
    when(mockIamBindingRetriever.listIAMBindingData(eq(Collections.emptyList()), any(), any(), any(), isNull()))
        .thenReturn(IAM_BINDING_SINGLE_ENTRY_WITHIN_30_DAYS);
    when(mockIamBindingRetriever.listIAMBindingData(any(), any(), any(), any(), eq(1595304000000L)))
        .thenReturn(IAM_BINDING_SINGLE_ENTRY_OUTSIDE_30_DAYS);
    List<IAMBindingDatabaseEntry> actual = manualDataUpdater.listUpdatedIAMBindingData();
  }

}
