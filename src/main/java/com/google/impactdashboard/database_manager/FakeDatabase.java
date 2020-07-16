package com.google.impactdashboard.database_manager;

import java.lang.Math;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import com.google.impactdashboard.data.recommendation.*;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
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
          Recommendation.create("project-id-1", 
            "remove unused permissions from user account test3@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, 1592486705000L, 
            IAMRecommenderMetadata.create(300)));
        put(1592486585000L, 
          Recommendation.create("project-id-1", 
            "remove unused permissions from user account test2@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, 1592486585000L, 
            IAMRecommenderMetadata.create(1000))); 
        put(1591633823000L, 
          Recommendation.create("project-id-1", 
            "remove unused permissions from user account test@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, 1591633823000L, 
            IAMRecommenderMetadata.create(1000))); 
        put(1591704613000L, 
          Recommendation.create("project-id-2", 
            "remove unused permissions from user account test4@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, 1591704613000L, 
            IAMRecommenderMetadata.create(500)));  
        put(1593072312000L, 
          Recommendation.create("project-id-2", 
            "remove unused permissions from user account test5@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, 1593072312000L, 
            IAMRecommenderMetadata.create(350)));    
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
   * Retrieves the bindings data associated with {@code projectId} in the bindings 
   * table. 
   * @param projectId The id of the project taht the data is for.*/
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
      ((Recommendation) mapElement.getValue()).getProjectId().equals(projectId))
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
