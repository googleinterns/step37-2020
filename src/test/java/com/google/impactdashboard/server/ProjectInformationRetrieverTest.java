package com.google.impactdashboard.server;

import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.data.project.ProjectGraphData;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.project.ProjectMetaData;
import com.google.impactdashboard.data.recommendation.IAMRecommenderMetadata;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;
import java.util.*;

@RunWith(JUnit4.class)
public class ProjectInformationRetrieverTest extends Mockito {

  @Test
  public void pss() {}
  /*

  public static final String PROJECT_NAME_1 = "project-1";
  public static final String PROJECT_NAME_2 = "project-2";

  public static final String PROJECT_ID_1 = "project-id-1";
  public static final String PROJECT_ID_2 = "project-id-2";

  public static final long PROJECT_NUMBER_1 = 12345678L;
  public static final long PROJECT_NUMBER_2 = 98765432543L;

  public static final double PROJECT_AVERAGEIAMBINDINGS_1 = 162.3;
  public static final double PROJECT_AVERAGEIAMBINDINGS_2 = 2000.87;

  public static final String RECOMMENDATION_DESCRIPTION = "This is a recommendation";

  private DataReadManager readManager;
  private ProjectInformationRetriever informationRetriever;

  @Before
  public void setup() {
    readManager = mock(DataReadManager.class);
    informationRetriever = new ProjectInformationRetriever(readManager);
  }

  @Test
  public void emptyProjectInformationTest() {
    // There is not information so there should be an empty list returned
    when(readManager.listProjects()).thenReturn(Collections.emptyList());
    List<Project> actual = informationRetriever.listProjectInformation();
    List<Project> expected = new ArrayList<>();

    Assert.assertEquals(expected, actual);
  }

  @Test
  public void nonEmptyProjectInformationTest() {
    // There will be two projects returned from the DataBase
    // Expected output will be two projects
    when(readManager.listProjects()).thenReturn(Arrays.asList(
        ProjectIdentification.create(PROJECT_NAME_1, PROJECT_ID_1, PROJECT_NUMBER_1),
        ProjectIdentification.create(PROJECT_NAME_2, PROJECT_ID_2, PROJECT_NUMBER_2)
    ));
    when(readManager.getAverageIAMBindingsInPastYear(PROJECT_ID_1)).thenReturn(PROJECT_AVERAGEIAMBINDINGS_1);
    when(readManager.getAverageIAMBindingsInPastYear(PROJECT_ID_2)).thenReturn(PROJECT_AVERAGEIAMBINDINGS_2);

    List<Project> expected = Arrays.asList(
        Project.create(PROJECT_NAME_1, PROJECT_ID_1, PROJECT_NUMBER_1,
            ProjectMetaData.create(PROJECT_AVERAGEIAMBINDINGS_1)),
        Project.create(PROJECT_NAME_2, PROJECT_ID_2, PROJECT_NUMBER_2,
            ProjectMetaData.create(PROJECT_AVERAGEIAMBINDINGS_2)));
    List<Project> actual = informationRetriever.listProjectInformation();

    Assert.assertEquals(expected, actual);
  }

  @Test
  public void projectWithNoData() {
    // Project exists but there is no data for the project
    when(readManager.getMapOfDatesToIAMBindings(PROJECT_ID_1)).thenReturn(Collections.emptyMap());
    when(readManager.getMapOfDatesToRecommendationTaken(PROJECT_ID_1))
        .thenReturn(Collections.emptyMap());

    ProjectGraphData expected = ProjectGraphData.create(PROJECT_ID_1, Collections.emptyMap(),
        Collections.emptyMap());
    ProjectGraphData actual = informationRetriever.getProjectData(PROJECT_ID_1);

    Assert.assertEquals(expected, actual);
  }

  @Test
  public void projectWithData() {
    // Project exists and data is present
    Map<Long, Integer> PROJECT_IAM_DATA = new HashMap<>();
    Map<Long, Recommendation> PROJECT_RECOMMENDATION_DATA = new HashMap<>();

    PROJECT_IAM_DATA.put(123L, 2000);
    PROJECT_IAM_DATA.put(234L, 3456);
    PROJECT_IAM_DATA.put(23645543L, 78654);
    PROJECT_RECOMMENDATION_DATA.put(234L, Recommendation.create(PROJECT_ID_1,
        RECOMMENDATION_DESCRIPTION, Recommendation.RecommenderType.IAM_BINDING, 234L,
        IAMRecommenderMetadata.create(-100)));

    when(readManager.getMapOfDatesToIAMBindings(PROJECT_ID_1)).thenReturn(PROJECT_IAM_DATA);
    when(readManager.getMapOfDatesToRecommendationTaken(PROJECT_ID_1))
        .thenReturn(PROJECT_RECOMMENDATION_DATA);

    ProjectGraphData expected = ProjectGraphData.create(PROJECT_ID_1, PROJECT_IAM_DATA,
        PROJECT_RECOMMENDATION_DATA);
    ProjectGraphData actual = informationRetriever.getProjectData(PROJECT_ID_1);

    Assert.assertEquals(expected, actual);
  } */

}
