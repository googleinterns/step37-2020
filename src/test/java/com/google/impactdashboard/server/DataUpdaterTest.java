package com.google.impactdashboard.server;

import com.google.apphosting.api.logservice.LogServicePb.LogReadRequest;
import com.google.impactdashboard.configuration.Configuration;
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

    manualDataUpdater = new DataUpdater(
        mockLogRetriever, mockRecommendationRetriever, fakeDataUpdateManager, 
        fakeDataReadManager, mockIamBindingRetriever, true);
    automaticDataUpdater = new DataUpdater(
        mockLogRetriever, mockRecommendationRetriever, fakeDataUpdateManager, 
        fakeDataReadManager, mockIamBindingRetriever, false);
  }

  // @Test
  // public void 
}
