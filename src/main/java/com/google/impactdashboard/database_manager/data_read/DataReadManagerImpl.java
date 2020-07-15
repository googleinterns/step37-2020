package com.google.impactdashboard.database_manager.data_read;

import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.IAMRecommenderMetadata;
import com.google.impactdashboard.data.recommendation.Recommendation;
import com.google.impactdashboard.configuration.*;
import com.google.impactdashboard.database_manager.bigquery.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import com.google.cloud.bigquery.TableResult;
import com.google.cloud.bigquery.FieldValueList;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.QueryParameterValue;

/** Class for returning data from the database. */
public class DataReadManagerImpl implements DataReadManager {
  DatabaseAccessor database;
  QueryConfigurationBuilder queryConfigurationBuilder;

  public DataReadManagerImpl() {
    database = new DatabaseAccessor(); 
    queryConfigurationBuilder = QueryConfigurationBuilderFactory.create();
  }
  
  /** 
   *  Returns a list containing identifying information for all projects in the 
   *  IAM Bindings table.  
   */
  @Override
  public List<ProjectIdentification> listProjects() {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .getProjectIdsConfiguration().build();
    TableResult results = database.readDatabase(queryConfiguration);

    List<ProjectIdentification> listOfProjects = new ArrayList<ProjectIdentification>();
    for (FieldValueList row : results.iterateAll()) {
      String projectId = row.get(IAMBindingsSchema.IAM_PROJECT_ID_COLUMN).getStringValue();
      listOfProjects.add(getProjectIdentificationForProject(projectId));
    }
    return listOfProjects;
  }

  /** 
   *  Returns the average number of IAM bindings that the project with id 
   *  {@code projectId} had per day over the past 365 days (or, if there are 
   *  not 365 days of data in the IAM Bindings table, the average over however 
   *  many days of data are in the table). If the project has no data, returns 0.
   */
  @Override
  public double getAverageIAMBindingsInPastYear(String projectId) {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .getAverageBindingsConfiguration()
      .addNamedParameter("projectId", QueryParameterValue.string(projectId))
      .build();
    TableResult results = database.readDatabase(queryConfiguration);
    
    double avgNumberOfBindings = 0.0;
    for (FieldValueList row : results.iterateAll()) {
      avgNumberOfBindings = row.get("AverageBindings").getDoubleValue();
    }
    return avgNumberOfBindings; 
  }

  /**
   *  Returns a map of dates (as timestamps in UTC milliseconds since the epoch) 
   *  to the Recommendation applied on that date to the project with id {@code projectId}.
   */
  @Override
  public Map<Long, Recommendation> getMapOfDatesToRecommendationTaken(String projectId) {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .getDatesToIAMRecommendationsConfiguration()
      .addNamedParameter("projectId", QueryParameterValue.string(projectId))
      .build();
    TableResult results = database.readDatabase(queryConfiguration);

    HashMap<Long, Recommendation> datesToRecommendations = new HashMap<Long, Recommendation>();
    for (FieldValueList row : results.iterateAll()) {
      long acceptedTimestamp = row.get(RecommendationsSchema.ACCEPTED_TIMESTAMP_COLUMN)
        .getTimestampValue() / 1000;
      String description = row.get(RecommendationsSchema.DESCRIPTION_COLUMN).getStringValue();
      int iamImpact = (int) row.get(RecommendationsSchema.IAM_IMPACT_COLUMN).getLongValue();

      datesToRecommendations.put(acceptedTimestamp, Recommendation.create(
        projectId, description, Recommendation.RecommenderType.IAM_BINDING, acceptedTimestamp, 
        IAMRecommenderMetadata.create(iamImpact)));
    } 
    return datesToRecommendations;
  }

  /** 
   *  Returns a map of dates (as timestamps in UTC milliseconds since the epoch) 
   *  to the number of IAM bindings that existed for the project with id {@code projectId} 
   *  on that date.
   */
  @Override
  public Map<Long, Integer> getMapOfDatesToIAMBindings(String projectId) {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .getDatesToBindingsConfiguration()
      .addNamedParameter("projectId", QueryParameterValue.string(projectId))
      .build();
    TableResult results = database.readDatabase(queryConfiguration);

    HashMap<Long, Integer> datesToBindings = new HashMap<Long, Integer>();
    for (FieldValueList row : results.iterateAll()) {
      long timestamp = row.get(IAMBindingsSchema.TIMESTAMP_COLUMN)
        .getTimestampValue() / 1000;
      int iamBindings = (int) row.get(IAMBindingsSchema.NUMBER_BINDINGS_COLUMN).getLongValue();

      datesToBindings.put(timestamp, iamBindings);
    } 
    return datesToBindings;
  }

  /**
   * Queries the IAM database for information about the project with id 
   * {@code projectId}, and returns a {@code ProjectIdentification} object 
   * containing that information. 
   */
  private ProjectIdentification getProjectIdentificationForProject(String projectId) {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .getProjectIdentificationInformationConfiguration()
      .addNamedParameter("projectId", QueryParameterValue.string(projectId))
      .build();
    TableResult results = database.readDatabase(queryConfiguration);
    
    String projectName = null;
    String projectNumber = null;
    for (FieldValueList row : results.iterateAll()) {
      projectName = row.get(IAMBindingsSchema.PROJECT_NAME_COLUMN).getStringValue();
      projectNumber = row.get(IAMBindingsSchema.PROJECT_NUMBER_COLUMN).getStringValue();
    }

    if (projectName == null || projectNumber == null) {
      throw new RuntimeException("Database failed to retrieve project information.");
    }

    return ProjectIdentification.create(projectName, projectId, Long.parseLong(projectNumber));
  }
}
