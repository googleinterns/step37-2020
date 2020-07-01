package com.google.impactdashboard.server;

import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.project.ProjectMetaData;
import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RunWith(JUnit4.class)
public class ProjectInformationRetrieverTest extends Mockito {

  public static final String PROJECT_NAME_1 = "project-1";
  public static final String PROJECT_NAME_2 = "project-2";

  public static final String PROJECT_ID_1 = "project-id-1";
  public static final String PROJECT_ID_2 = "project-id-2";

  public static final long PROJECT_NUMBER_1 = 12345678L;
  public static final long PROJECT_NUMBER_2 = 98765432543L;

  public static final double PROJECT_AVERAGEIAMBINDINGS_1 = 162.3;
  public static final double PROJECT_AVERAGEIAMBINDINGS_2 = 2000.87;


  private DataReadManager readManager;
  private ProjectInformationRetriever informationRetriever;

  @Before
  public void setup() {
    readManager = mock(DataReadManager.class);
  }

  @Test
  public void emptyProjectInformationTest() {
    // There is not information so there should be an empty list returned
    when(readManager.listProjects()).thenReturn(Collections.emptyList());
    informationRetriever = ProjectInformationRetriever.create(readManager);
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

    informationRetriever = ProjectInformationRetriever.create(readManager);
    List<Project> expected = Arrays.asList(
        Project.create(PROJECT_NAME_1, PROJECT_ID_1, PROJECT_NUMBER_1,
            ProjectMetaData.create(PROJECT_AVERAGEIAMBINDINGS_1)),
        Project.create(PROJECT_NAME_2, PROJECT_ID_2, PROJECT_NUMBER_2,
            ProjectMetaData.create(PROJECT_AVERAGEIAMBINDINGS_2)));
    List<Project> actual = informationRetriever.listProjectInformation();

    Assert.assertEquals(expected, actual);
  }

}
