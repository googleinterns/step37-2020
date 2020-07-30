package com.google.impactdashboard.database_manager;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.junit.runners.MethodSorters;
import com.google.impactdashboard.configuration.Configuration;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.*;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.organization.OrganizationIdentification;
import com.google.impactdashboard.database_manager.data_read.*;
import com.google.impactdashboard.database_manager.data_update.*;

import java.util.Arrays;
import java.util.Map;
import java.io.IOException;

@RunWith(JUnit4.class)
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DataUpdateManagerTest {

  private static DataReadManager dataReadManager;
  private static DataUpdateManager dataUpdateManager;

  private static final ProjectIdentification PROJECT_2_IDENTIFICATION = 
    ProjectIdentification.create("project-2", "project-id-2", 234567890123L);
  private static final String PROJECT_ID_1 = "project-id-1";
  private static final String PROJECT_ID_2 = "project-id-2";
  private static final String ORG_1_ID = "test-org-1";
  private static final OrganizationIdentification ORG_2_IDENTIFICATION = 
    OrganizationIdentification.create("Org 2", "test-org-2");

  private static final Recommendation PROJECT_1_RECOMMENDATION_ON_20190628 = 
    Recommendation.create(
      PROJECT_ID_1, ORG_1_ID, "test@example.com",
      Arrays.asList(
        RecommendationAction.create(
          "affected@example.com", "roles/owner", "roles/viewer",
          RecommendationAction.ActionType.REPLACE_ROLE),
        RecommendationAction.create(
          "affected@example.com", "roles/BigqueryAdmin", "",
          RecommendationAction.ActionType.REMOVE_ROLE)), 
      Recommendation.RecommenderType.IAM_BINDING, 1561723200000L, 
      IAMRecommenderMetadata.create(100));
  private static final Recommendation PROJECT_1_RECOMMENDATION_ON_20190625 = 
    Recommendation.create(
      PROJECT_ID_1, ORG_1_ID, "test@example.com",
      Arrays.asList(
          RecommendationAction.create(
            "affected@example.com", "roles/owner", "",
            RecommendationAction.ActionType.REMOVE_ROLE)),
      Recommendation.RecommenderType.IAM_BINDING, 1561464000000L, 
      IAMRecommenderMetadata.create(500));
  private static final IAMBindingDatabaseEntry PROJECT_2_BINDINGS_DATA_ON_20190523 = 
    IAMBindingDatabaseEntry.create(
      PROJECT_ID_2, PROJECT_2_IDENTIFICATION.getName(), 
      PROJECT_2_IDENTIFICATION.getProjectNumber()+"", ORG_2_IDENTIFICATION, 
      1558612800000L, 2000);
  private static final IAMBindingDatabaseEntry PROJECT_2_BINDINGS_DATA_ON_20190620 = 
    IAMBindingDatabaseEntry.create(
      PROJECT_ID_2, PROJECT_2_IDENTIFICATION.getName(), 
      PROJECT_2_IDENTIFICATION.getProjectNumber()+"", ORG_2_IDENTIFICATION, 
      1561032000000L, 1000);

  @BeforeClass
  public static void setTestingConfiguration() throws IOException {
    Configuration.useTestDatabase = true;
    dataReadManager = DataReadManagerFactory.create();
    dataUpdateManager = DataUpdateManagerFactory.create();
  }

  @AfterClass
  public static void undoTestingConfiguration() {
    Configuration.useTestDatabase = false;
  }

  @Test
  public void testAddingNoEntriesRunsWithoutError() {
    dataUpdateManager.updateRecommendations(Arrays.asList());
    dataUpdateManager.updateIAMBindings(Arrays.asList());
  }

  @Test
  public void testARecommendationsAddedToDatabase() {
    dataUpdateManager.updateRecommendations(Arrays.asList(
      PROJECT_1_RECOMMENDATION_ON_20190628, PROJECT_1_RECOMMENDATION_ON_20190625));
    Map<Long, Recommendation> datesToRecommendations = dataReadManager
      .getMapOfDatesToRecommendationTaken(PROJECT_ID_1);

    assertTrue("The database now contains the dates that were just added",
      datesToRecommendations.containsKey(PROJECT_1_RECOMMENDATION_ON_20190625
        .getAcceptedTimestamp()) && 
      datesToRecommendations.containsKey(PROJECT_1_RECOMMENDATION_ON_20190628
        .getAcceptedTimestamp()));
    assertEquals(
      PROJECT_1_RECOMMENDATION_ON_20190625, datesToRecommendations
        .get(PROJECT_1_RECOMMENDATION_ON_20190625.getAcceptedTimestamp()));
    assertEquals(
      PROJECT_1_RECOMMENDATION_ON_20190628, datesToRecommendations
        .get(PROJECT_1_RECOMMENDATION_ON_20190628.getAcceptedTimestamp()));
  }

  @Test
  public void testBIAMBindingsAddedToDatabase() {
    dataUpdateManager.updateIAMBindings(Arrays.asList(
      PROJECT_2_BINDINGS_DATA_ON_20190620, PROJECT_2_BINDINGS_DATA_ON_20190523));
    Map<Long, Integer> datesToBindings = dataReadManager
      .getMapOfDatesToIAMBindings(PROJECT_ID_2);

    assertTrue("The database now contains the dates that were just added",
      datesToBindings.containsKey(PROJECT_2_BINDINGS_DATA_ON_20190620.getTimestamp()) &&
      datesToBindings.containsKey(PROJECT_2_BINDINGS_DATA_ON_20190523.getTimestamp()));
    assertEquals((Integer) PROJECT_2_BINDINGS_DATA_ON_20190620.getBindingsNumber(), 
      datesToBindings.get(PROJECT_2_BINDINGS_DATA_ON_20190620.getTimestamp()));
    assertEquals((Integer) PROJECT_2_BINDINGS_DATA_ON_20190523.getBindingsNumber(), 
      datesToBindings.get(PROJECT_2_BINDINGS_DATA_ON_20190523.getTimestamp()));
  }

  @Test
  public void testCAllNewDataDeleted() {
    dataUpdateManager.deleteYearOldData();
    Map<Long, Integer> datesToBindings = dataReadManager
      .getMapOfDatesToIAMBindings(PROJECT_ID_2);
    Map<Long, Recommendation> datesToRecommendations = dataReadManager
      .getMapOfDatesToRecommendationTaken(PROJECT_ID_1);

    assertFalse("20190523 is no longer in the bindings database",
      datesToBindings.containsKey(PROJECT_2_BINDINGS_DATA_ON_20190523.getTimestamp()));
    assertFalse("20190620 is no longer in the bindings database",
      datesToBindings.containsKey(PROJECT_2_BINDINGS_DATA_ON_20190620.getTimestamp()));
    assertFalse("20190625 is no longer in the recommendations database",
      datesToRecommendations.containsKey(
        PROJECT_1_RECOMMENDATION_ON_20190625.getAcceptedTimestamp()));
    assertFalse("20190628 is no longer in the recommendations database",
      datesToRecommendations.containsKey(
        PROJECT_1_RECOMMENDATION_ON_20190628.getAcceptedTimestamp()));
  } 

  @Test
  public void testDOldDataStillInDatabase() {
    Map<Long, Integer> datesToBindings = dataReadManager
      .getMapOfDatesToIAMBindings(PROJECT_ID_2);
    Map<Long, Recommendation> datesToRecommendations = dataReadManager
      .getMapOfDatesToRecommendationTaken(PROJECT_ID_1);

    assertTrue("Check for June 12th data in IAM Table", 
      datesToBindings.containsKey(1591963200000L));
    assertTrue("Check for June 25th data in IAM Table", 
      datesToBindings.containsKey(1593086400000L));
    assertTrue("Check for June 18th in Recommendations Table", 
      datesToRecommendations.containsKey(1592486705000L));
    assertTrue("Check for June 8th in Recommendations Table",
      datesToRecommendations.containsKey(1591633823000L));
  } 
}
