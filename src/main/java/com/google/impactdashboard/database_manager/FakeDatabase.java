package com.google.impactdashboard.database_manager;

import java.lang.Math;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import com.google.impactdashboard.data.recommendation.*;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.organization.OrganizationIdentification;

import java.util.concurrent.atomic.AtomicReference;

/** A class that maintains a fake database for testing purposes. */
public class FakeDatabase {
  private static final long MILLISECONDS_365_DAYS = 31536000000L;
  private static final long MILLISECONDS_ONE_DAY = 86400000;

  /** 
   * Represents a database table that holds information about accepted 
   * recommendations. 
   */
  private static Map<Long, Recommendation> recommendations = 
    new HashMap<Long, Recommendation>() {
        private static final long serialVersionUID = 1L;

        {
        put(1592486705000L, 
          Recommendation.create("project-id-1", "org-1-id",
            "test1@example.com", 
            Arrays.asList(
              RecommendationAction.create(
                "affected1@example.com", "roles/owner", "roles/viewer", 
                RecommendationAction.ActionType.REPLACE_ROLE)),
            Recommendation.RecommenderType.IAM_BINDING, 1592486705000L, 
            IAMRecommenderMetadata.create(300)));
        put(1592486585000L, 
          Recommendation.create("project-id-1", "org-1-id",
            "test2@example.com", 
            Arrays.asList(
              RecommendationAction.create(
                "affected2@example.com", "roles/owner", "", 
                RecommendationAction.ActionType.REMOVE_ROLE)), 
            Recommendation.RecommenderType.IAM_BINDING, 1592486585000L, 
            IAMRecommenderMetadata.create(1000))); 
        put(1591633823000L, 
          Recommendation.create("project-id-1", "org-1-id",
            "test3@example.com", 
            Arrays.asList(
              RecommendationAction.create(
                "affected3@example.com", "roles/editor", "roles/storage.objectAdmin",
                RecommendationAction.ActionType.REPLACE_ROLE), 
              RecommendationAction.create(
                "affected3@example.com", "roles/viewer", "",
                RecommendationAction.ActionType.REMOVE_ROLE)), 
            Recommendation.RecommenderType.IAM_BINDING, 1591633823000L, 
            IAMRecommenderMetadata.create(1000))); 
        put(1591704613000L, 
          Recommendation.create("project-id-2", "org-1-id",
            "test4@example.com", 
            Arrays.asList(
              RecommendationAction.create(
                "affected4@example.com", "roles/owner", "roles/viewer",
                RecommendationAction.ActionType.REPLACE_ROLE)),  
            Recommendation.RecommenderType.IAM_BINDING, 1591704613000L, 
            IAMRecommenderMetadata.create(500)));  
        put(1593072312000L, 
          Recommendation.create("project-id-2", "org-1-id",
            "test5@example.com", 
            Arrays.asList(
              RecommendationAction.create(
                "affected5@example.com", "roles/editor", "",
                RecommendationAction.ActionType.REMOVE_ROLE)), 
            Recommendation.RecommenderType.IAM_BINDING, 1593072312000L, 
            IAMRecommenderMetadata.create(350)));    
      }
    };

  /** 
   * Mapping of project ids to the identification information of the organization 
   * they belong to. 
   */
  private static Map<String, OrganizationIdentification> projectsToOrganizations = 
    new HashMap<String, OrganizationIdentification>() {
        private static final long serialVersionUID = 1L;
      {
        put("project-id-1", OrganizationIdentification.create("Org 1", "org-1-id"));
        put("project-id-2", OrganizationIdentification.create("Org 1", "org-1-id"));
      }
  };

  /** 
   * Mapping of project ids to the identification information of the project.
   */
  private static Map<String, ProjectIdentification> projectsToIdentification = 
    new HashMap<String, ProjectIdentification>() {
        private static final long serialVersionUID = 1L;
      {
        put("project-id-1", 
          ProjectIdentification.create("project-1", "project-id-1", 123456789123L));
        put("project-id-2", 
          ProjectIdentification.create("project-2", "project-id-2", 234567890123L));
      }
  };

  /** Represents a database table that holds information about IAM Bindings. */
  private static Map<ProjectIdentification, Map<Long, Integer>> iamBindings = 
    new HashMap<ProjectIdentification, Map<Long, Integer>>() {
        private static final long serialVersionUID = 1L;

        {
        HashMap<Long, Integer> bindingsProject1 = new HashMap<Long, Integer>();
        AtomicReference<Long> date1 = new AtomicReference<Long>(1590883200000L);

        Arrays.asList(1000, 1000, 1000, 2000, 2050, 2150, 2150, 2150, 2150, 
        1150, 1150, 1150, 1150, 2000, 2000, 2500, 2500, 2300, 2300, 1000, 
        1000, 1000, 1100, 1100, 1000, 1000, 1300, 1300, 1350, 1350)
        .forEach(numberBindings -> {
          bindingsProject1.put(date1.get(), numberBindings);
          date1.set(date1.get() + MILLISECONDS_ONE_DAY);
        });

        put(ProjectIdentification.create("project-1", "project-id-1", 
          123456789123L), bindingsProject1);

        HashMap<Long, Integer> bindingsProject2 = new HashMap<Long, Integer>();
        AtomicReference<Long> date2 = new AtomicReference<Long>(1590883200000L);

        Arrays.asList(500, 500, 750, 750, 750, 750, 750, 1000, 1000, 
        1000, 500, 500, 500, 600, 600, 600, 600, 300, 300, 1000, 
        1000, 1000, 1100, 1100, 1000, 1000, 500, 500, 500, 500)
        .forEach(numberBindings -> {
          bindingsProject2.put(date2.get(), numberBindings);
          date2.set(date2.get() + MILLISECONDS_ONE_DAY);
        });

        put(ProjectIdentification.create("project-2", "project-id-2", 
          234567890123L), bindingsProject2);
      }
  };

  /** 
   * Returns the identifying information of the projects that appear in the 
   * IAM Bindings table representation. 
   */
  public static List<ProjectIdentification> listProjects() {
    List<ProjectIdentification> projects = new ArrayList<ProjectIdentification>();
    iamBindings.forEach((project, data) -> projects.add(project));
    return projects;
  }

  /**
   * Returns the identifying information of the organizations that appear in the 
   * fake database. 
   */
  public static List<OrganizationIdentification> listOrganizations() {
    Set<OrganizationIdentification> organizations = new HashSet<>();
    projectsToOrganizations.entrySet().stream()
      .forEach(entry -> organizations.add(entry.getValue()));
    return organizations.stream().collect(Collectors.toList()); 
  }

  /** 
   * Retrieves the bindings data associated with {@code projectId} in the bindings 
   * table. 
   * @param projectId The id of the project that the data is for.
   */
  public static Map<Long, Integer> getDatesToBindingsForProject(String projectId) {
    AtomicReference<Map<Long, Integer>> dailyBindings = 
      new AtomicReference<Map<Long, Integer>>();
    dailyBindings.set(new HashMap<>());
    iamBindings.forEach((project, data) -> {
      if (project.getProjectId().equals(projectId)) {
        dailyBindings.set(data);
      }
    });
    return dailyBindings.get();
  }

  /**
   * Retrieves the bindings data associated with {@organizationId} in the
   * fake database.
   * @param organizationId the id of the organization that the data is for.
   */
  public static Map<Long, Integer> getDatesToBindingsForOrganization(String organizationId) {
    Map<Long, Integer> totalBindings = new HashMap<Long, Integer>();
    projectsToOrganizations.entrySet().stream().forEach(entry -> {
      if (entry.getValue().getId().equals(organizationId)) {
        iamBindings.get(projectsToIdentification.get(entry.getKey())).entrySet().stream()
          .forEach(bindingEntry -> {
            Long timestamp = bindingEntry.getKey();
            if (totalBindings.containsKey(timestamp)) {
              totalBindings.put(timestamp, totalBindings.get(timestamp) + bindingEntry.getValue());
            } else {
              totalBindings.put(timestamp, bindingEntry.getValue());
            }
          });
      }
    });
    return totalBindings;
  }

  /** 
   * Returns the average bindings recorded in the bindings table for a given 
   * project, or 0 if this project does not appear in the bindings table. 
   * @param projectId The id of the project the data is for.
   */
  public static double getAvgBindingsForProject(String projectId) {
    Map<Long, Integer> dailyBindings = getDatesToBindingsForProject(projectId);

    if (dailyBindings.size() == 0) {
      return 0;
    }

    AtomicReference<Double> averageBindings = new AtomicReference<Double>();
    averageBindings.set(0.0);
    dailyBindings.forEach((date, bindings) -> {
      averageBindings.set(averageBindings.get() + bindings);
    });
    return averageBindings.get() / dailyBindings.size();
  }

  /** 
   * Returns the average bindings recorded in the bindings table for a given 
   * organization, summed over all the projects belonging to that organization, 
   * or 0 if this project does not appear in the bindings table. 
   * @param organizationId The id of the organization the data is for.
   */
  public static double getAvgBindingsForOrganization(String organizationId) {
    Map<Long, Integer> totalBindings = getDatesToBindingsForOrganization(organizationId);

    if (totalBindings.size() == 0) {
      return 0;
    }

    AtomicReference<Double> averageBindings = new AtomicReference<Double>();
    averageBindings.set(0.0);
    totalBindings.forEach((date, bindings) -> {
      averageBindings.set(averageBindings.get() + bindings);
    });
    return averageBindings.get() / totalBindings.size();
  }

  /** Returns the newest timestamp in the IAM table, or -1 if there is no data. */
  public static long getMaxTimestamp() {
    return iamBindings.entrySet().stream()
      .reduce(-1L, 
        (accumulator, entry) -> 
          Math.max(accumulator, 
            entry.getValue().entrySet().stream()
              .reduce(-1L, (maxTime, mapping) -> Math.max(maxTime, mapping.getKey()), Math::max)), 
        Math::max);
  }

  /** 
   * Returns a map of entries in the recommendations table associated with 
   * {@code projectId}. 
   * @param projectId The id of the project the data is for.
   */
  public static Map<Long, Recommendation> getDatesToRecommendationsForProject(
    String projectId) {
    return recommendations.entrySet().stream()
      .filter(mapElement -> 
        mapElement.getValue().getProjectId().equals(projectId))
      .collect(Collectors.toMap(
        mapElement -> mapElement.getKey(), mapElement -> mapElement.getValue()));
  }

  /** 
   * Returns a map of entries in the recommendations table associated with 
   * {@code organizationId}. 
   */
  public static Map<Long, Recommendation> getDatesToRecommendationsForOrganization(
    String organizationId) {
    return recommendations.entrySet().stream()
      .filter(mapElement -> 
        mapElement.getValue().getOrganizationId().equals(organizationId))
      .collect(Collectors.toMap(
        mapElement -> mapElement.getKey(), mapElement -> mapElement.getValue()));
  }

  /** 
   * Adds {@code newRecommendations} to existing table of recommendations.
   * @param newRecommendations A list of Recommendations to be added to 
      the fake database. 
   */
  public static void addRecommendations(List<Recommendation> newRecommendations) {
    newRecommendations.forEach(recommendation -> {
      recommendations.put(recommendation.getAcceptedTimestamp(), recommendation);
    });
  }

  /** 
   * Adds data in {@code newIAMBindingsData} to existing bindings table. 
   * @param newIAMBindingsData A list of database entries to be added to the 
      fake database.
  */
  public static void addIAMBindingsData(
    List<IAMBindingDatabaseEntry> newIAMBindingsData) {
    newIAMBindingsData.forEach(dayOfData -> {
      ProjectIdentification project = ProjectIdentification.create(
        dayOfData.getProjectId(), dayOfData.getProjectName(), 
        Long.parseLong(dayOfData.getProjectNumber()));

      if (!projectsToIdentification.containsKey(dayOfData.getProjectId())) {
        projectsToIdentification.put(dayOfData.getProjectId(), project);
      }

      if (!projectsToOrganizations.containsKey(dayOfData.getProjectId())) {
        projectsToOrganizations.put(dayOfData.getProjectId(), dayOfData.getIdentification());
      }

      if (iamBindings.containsKey(project)) {
        iamBindings.get(project).put(
          dayOfData.getTimestamp(), dayOfData.getBindingsNumber());
      } else {
        HashMap<Long, Integer> dayOfDataBindingsMap = new HashMap<Long, Integer>();
        dayOfDataBindingsMap.put(dayOfData.getTimestamp(), dayOfData.getBindingsNumber());
        iamBindings.put(project, dayOfDataBindingsMap);
      }
    });
  }

  /** 
   * Deletes data in both the bindings and recommendations tables that is over 
   * 365 days older than the newest entries, if such data exists.
   */
  public static void deleteYearOldData() {
    long newestTimestamp = getMaxTimestamp();
    for (ProjectIdentification project : iamBindings.keySet()) {
      iamBindings.put(project, iamBindings.get(project).entrySet().stream()
        .filter(mapElement -> 
          mapElement.getKey() > (newestTimestamp - MILLISECONDS_365_DAYS))
        .collect(Collectors.toMap(
          mapElement -> mapElement.getKey(), 
          mapElement -> mapElement.getValue())));
    }
  }
}
