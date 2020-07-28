package com.google.impactdashboard.data;

import java.util.List;
import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.data.organization.Organization;
import com.google.auto.value.AutoValue;

/** A class that represents a list of project summaries and a list of organization summaries. */
@AutoValue
public abstract class DataSummaryList {
  
  public abstract List<Project> getProjects();
  public abstract List<Organization> getOrganizations();

  public static DataSummaryList create(List<Project> projects, List<Organization> organizations) {
    return new AutoValue_DataSummaryList(projects, organizations);
  }
}
