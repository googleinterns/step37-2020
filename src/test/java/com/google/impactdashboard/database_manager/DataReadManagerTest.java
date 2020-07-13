package com.google.impactdashboard.database_manager;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.impactdashboard.configuration.Configuration;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.*;
import com.google.impactdashboard.database_manager.data_read.*;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.io.IOException;

@RunWith(JUnit4.class)
public class DataReadManagerTest {

  private static DataReadManager dataReadManager;

  private static final ProjectIdentification PROJECT_1_IDENTIFICATION = 
    ProjectIdentification.create("project-1", "project-id-1", 123456789123L);
  private static final ProjectIdentification PROJECT_2_IDENTIFICATION = 
    ProjectIdentification.create("project-2", "project-id-2", 234567890123L);
  private static final String PROJECT_ID_1 = "project-id-1";
  private static final String PROJECT_ID_2 = "project-id-2";
  private static final Recommendation PROJECT_2_RECOMMENDATION_ON_25TH = 
    Recommendation.create(
      PROJECT_ID_2, "Remove unused permissions from user test5@example.com", 
      Recommendation.RecommenderType.IAM_BINDING, 1593115512000L, 
      IAMRecommenderMetadata.create(350));
  private static final Recommendation PROJECT_2_RECOMMENDATION_ON_9TH = 
    Recommendation.create(
      PROJECT_ID_2, "Remove unused permissions from user test4@example.com", 
      Recommendation.RecommenderType.IAM_BINDING, 1591704613000L, 
      IAMRecommenderMetadata.create(500));

  @BeforeClass
  public static void setTestingConfiguration() throws IOException {
    Configuration.useTestDatabase = true;
    dataReadManager = DataReadManagerFactory.create();
  }

  @AfterClass
  public static void undoTestingConfiguration() {
    Configuration.useTestDatabase = false;
  }

  @Test
  public void testAllProjectsListedCorrectly() {
    List<ProjectIdentification> actual = dataReadManager.listProjects();
    List<ProjectIdentification> expected = Arrays.asList(
      PROJECT_1_IDENTIFICATION, PROJECT_2_IDENTIFICATION);

    assertEquals(expected.size(), actual.size());
    actual.removeAll(expected);
    assertEquals(Arrays.asList(), actual);
  }

  @Test
  public void testAverageBindingsOnProject1() {
    int actual = (int) dataReadManager.getAverageIAMBindingsInPastYear(PROJECT_ID_1);
    int expected = 1545;

    assertEquals(expected, actual);
  }

  @Test
  public void testAverageBindingsOnProject2() {
    int actual = (int) dataReadManager.getAverageIAMBindingsInPastYear(PROJECT_ID_2);
    int expected = 715;

    assertEquals(expected, actual);
  }

  @Test
  public void testAverageBindingsReturnsZeroForNonexistentProject() {
    int actual = (int) dataReadManager.getAverageIAMBindingsInPastYear("does-not-exist");
    int expected = 0;

    assertEquals(expected, actual);
  }

  @Test
  public void testCorrectNumberOfDatesToBindingsReturnedOnProject1() {
    int actual = dataReadManager.getMapOfDatesToIAMBindings(PROJECT_ID_1).size();
    int expected = 30;

    assertEquals(expected, actual);
  }

  @Test
  public void testCorrectNumberOfDatesToRecommendationsReturnedOnProject1() {
    int actual = dataReadManager.getMapOfDatesToRecommendationTaken(PROJECT_ID_1).size();
    int expected = 3;

    assertEquals(expected, actual);
  }

  @Test
  public void testRandomDatesToBindingsForProject2() {
    Map<Long, Integer> datesToBindings = dataReadManager.getMapOfDatesToIAMBindings(PROJECT_ID_2);

    assertTrue(datesToBindings.containsKey(1591963200000L));
    assertEquals((Integer) 500, datesToBindings.get(1591963200000L));

    assertTrue(datesToBindings.containsKey(1593086400000L));
    assertEquals((Integer) 1000, datesToBindings.get(1593086400000L));
  }

  @Test
  public void testContentsOfDatesToRecommendationsForProject2() {
    Map<Long, Recommendation> datesToRecommendations = 
      dataReadManager.getMapOfDatesToRecommendationTaken(PROJECT_ID_2);  

    assertTrue("Timestamp of recommendation on 25th is retrieved from the database.", 
      datesToRecommendations.containsKey(
        PROJECT_2_RECOMMENDATION_ON_25TH.getAcceptedTimestamp()));
    assertEquals(PROJECT_2_RECOMMENDATION_ON_25TH, 
      datesToRecommendations.get(PROJECT_2_RECOMMENDATION_ON_25TH.getAcceptedTimestamp()));

    assertTrue("Timestamp of recommendation on 9th is retrieved from the database.", 
      datesToRecommendations.containsKey(
        PROJECT_2_RECOMMENDATION_ON_9TH.getAcceptedTimestamp()));
    assertEquals(PROJECT_2_RECOMMENDATION_ON_9TH, 
      datesToRecommendations.get(PROJECT_2_RECOMMENDATION_ON_9TH.getAcceptedTimestamp()));
  }

  @Test
  public void testNoRecommendationsReturnedForNonexistentProject() {
    int actual = dataReadManager.getMapOfDatesToRecommendationTaken("does-not-exist").size();
    int expected = 0;

    assertEquals(expected, actual);
  }

  @Test
  public void testNoBindingsReturnedForNonexistentProject() {
    int actual = dataReadManager.getMapOfDatesToIAMBindings("does-not-exist").size();
    int expected = 0;

    assertEquals(expected, actual);
  } 
}
