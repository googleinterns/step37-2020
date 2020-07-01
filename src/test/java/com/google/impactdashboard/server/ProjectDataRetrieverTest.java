package com.google.impactdashboard.server;

import com.google.impactdashboard.data.project.ProjectGraphData;
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

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RunWith(JUnit4.class)
public class ProjectDataRetrieverTest extends Mockito {

  public static final String PROJECT_ID_1 = "project-id-1";

  public static final String RECOMMENDATION_DESCRIPTION = "This is a recommendation";

  public static final Map<Long, Integer> PROJECT_IAM_DATA = new HashMap<>();
  public static final Map<Long, Recommendation> PROJECT_RECOMMENDATION_DATA = new HashMap<>();

  private DataReadManager readManager;
  private ProjectDataRetriever dataRetriever;

  @Before
  public void setup() {
    readManager = mock(DataReadManager.class);
    dataRetriever = ProjectDataRetriever.create(readManager);
  }

  @Test
  public void projectWithNoData() {
    // Project exists but there is no data for the project
    when(readManager.getMapOfDatesToIAMBindings(PROJECT_ID_1)).thenReturn(Collections.emptyMap());
    when(readManager.getMapOfDatesToRecommendationTaken(PROJECT_ID_1))
        .thenReturn(Collections.emptyMap());

    ProjectGraphData expected = ProjectGraphData.create(PROJECT_ID_1, Collections.emptyMap(),
        Collections.emptyMap());
    ProjectGraphData actual = dataRetriever.getProjectData(PROJECT_ID_1);

    Assert.assertEquals(expected, actual);
  }

  @Test
  public void projectWithData() {
    // Project exists and data is present
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
    ProjectGraphData actual = dataRetriever.getProjectData(PROJECT_ID_1);

    Assert.assertEquals(expected, actual);
  }
}
