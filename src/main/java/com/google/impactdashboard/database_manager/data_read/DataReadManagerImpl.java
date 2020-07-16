package com.google.impactdashboard.database_manager.data_read;

import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.*;
import com.google.impactdashboard.configuration.*;
import com.google.impactdashboard.database_manager.bigquery.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.google.cloud.bigquery.TableResult;
import com.google.cloud.bigquery.FieldValueList;
import com.google.cloud.bigquery.FieldValue;
import com.google.cloud.bigquery.FieldList;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.QueryParameterValue;
import com.google.common.collect.Iterables;

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
    FieldValueList row = Iterables.getOnlyElement(results.iterateAll(), null);

    if (row == null || row.get("AverageBindings").isNull()) {
      return 0.0;
    } else {
      return row.get("AverageBindings").getDoubleValue();
    }
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
      String actor = row.get(RecommendationsSchema.ACTOR_COLUMN).getStringValue();
      int iamImpact = (int) row.get(RecommendationsSchema.IAM_IMPACT_COLUMN).getLongValue();

      FieldList structSchema = results.getSchema().getFields()
        .get(RecommendationsSchema.ACTIONS_COLUMN).getSubFields();
      List<RecommendationAction> actions = structActionsToRecommendationActions(
        row.get(RecommendationsSchema.ACTIONS_COLUMN).getRepeatedValue(), structSchema);

      datesToRecommendations.put(acceptedTimestamp, Recommendation.create(
        projectId, actor, actions, Recommendation.RecommenderType.IAM_BINDING, 
        acceptedTimestamp, IAMRecommenderMetadata.create(iamImpact)));
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
   * Queries the IAM Table and returns the most recent timestamp, or -1 if there is
   * no data.
   */
  public long getMostRecentTimestamp() {
    QueryJobConfiguration queryConfiguration = queryConfigurationBuilder
      .getMostRecentTimestampConfiguration()
      .build();
    TableResult results = database.readDatabase(queryConfiguration);
    FieldValueList row = Iterables.getOnlyElement(results.iterateAll(), null);

    if (row == null || row.get("Max_Timestamp").isNull()) {
      return -1;
    } else {
      return row.get("Max_Timestamp").getTimestampValue() / 1000;
    }
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
    FieldValueList row = Iterables.getOnlyElement(results.iterateAll(), null);

    if (row == null) {
      throw new RuntimeException(
        "Database failed to retrieve project information for project " + projectId);
    } else {
      String projectName = row.get(IAMBindingsSchema.PROJECT_NAME_COLUMN).getStringValue();
      String projectNumber = row.get(IAMBindingsSchema.PROJECT_NUMBER_COLUMN).getStringValue();
      return ProjectIdentification.create(projectName, projectId, Long.parseLong(projectNumber));
    }
  }

  /** 
   * Converts a list of SQL structs representing recommendation actions to a 
   * list of RecommendationAction objects. 
   */
  private List<RecommendationAction> structActionsToRecommendationActions(
    List<FieldValue> actions, FieldList structSchema) {
    return actions.stream().map(action -> {
      FieldValueList structAction = FieldValueList.of(action.getRecordValue(), structSchema);
      String affectedAccount = structAction
        .get(RecommendationsSchema.ACCOUNT_AFFECTED_FIELD).getStringValue();
      String previousRole = structAction
        .get(RecommendationsSchema.PREVIOUS_ROLE_FIELD).getStringValue();
      String newRole = structAction
        .get(RecommendationsSchema.NEW_ROLE_FIELD).getStringValue();
      return RecommendationAction.create(affectedAccount, previousRole, newRole);
    }).collect(Collectors.toList());
  }
}
