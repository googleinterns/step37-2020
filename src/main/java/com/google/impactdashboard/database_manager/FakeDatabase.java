package com.google.impactdashboard.database_manager;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import com.google.impactdashboard.data.recommendation.*;
import com.google.impactdashboard.data.project.ProjectIdentification;
import java.util.concurrent.atomic.AtomicReference;

/** A class that maintains a fake database for testing purposes. */
public class FakeDatabase {
  /** 
   * Represents a database table that holds information about accepted 
   * recommendations. 
   */
  private static Map<Long, Recommendation> recommendations = 
    new HashMap<Long, Recommendation>() {
        private static final long serialVersionUID = 1L;

        {
        put(Long.parseLong("1592486705000"), 
          Recommendation.create("project-id-1", 
            "remove unused permissions from user account test3@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1592486705000"), 
            IAMRecommenderMetadata.create(300)));
        put(Long.parseLong("1592486585000"), 
          Recommendation.create("project-id-1", 
            "remove unused permissions from user account test2@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1592486585000"), 
            IAMRecommenderMetadata.create(1000))); 
        put(Long.parseLong("1591633823000"), 
          Recommendation.create("project-id-1", 
            "remove unused permissions from user account test@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1591633823000"), 
            IAMRecommenderMetadata.create(1000))); 
        put(Long.parseLong("1591704613000"), 
          Recommendation.create("project-id-2", 
            "remove unused permissions from user account test4@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1591704613000"), 
            IAMRecommenderMetadata.create(500)));  
        put(Long.parseLong("1593072312000"), 
          Recommendation.create("project-id-2", 
            "remove unused permissions from user account test5@google.com", 
            Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1593072312000"), 
            IAMRecommenderMetadata.create(350)));    
      }
    };

  /** Represents a database table that holds information about IAM Bindings. */
  private static HashMap<ProjectIdentification, HashMap<Long, Integer>> iamBindings = 
    new HashMap<ProjectIdentification, HashMap<Long, Integer>>() {
        private static final long serialVersionUID = 1L;

        {
        HashMap<Long, Integer> bindingsProject1 = new HashMap<Long, Integer>();
        AtomicReference<Long> date1 = new AtomicReference<Long>(Long.parseLong("1590883200000"));

        Arrays.asList(1000, 1000, 1000, 2000, 2050, 2150, 2150, 2150, 2150, 
        1150, 1150, 1150, 1150, 2000, 2000, 2500, 2500, 2300, 2300, 1000, 
        1000, 1000, 1100, 1100, 1000, 1000, 1300, 1300, 1350, 1350)
        .forEach(numberBindings -> {
          bindingsProject1.put(date1.get(), numberBindings);
          date1.set(date1.get() + 86400000);
        });

        put(ProjectIdentification.create("project-1", "project-id-1", 
          Long.parseLong("123456789123")), bindingsProject1);

        HashMap<Long, Integer> bindingsProject2 = new HashMap<Long, Integer>();
        AtomicReference<Long> date2 = new AtomicReference<Long>(Long.parseLong("1590883200000"));

        Arrays.asList(500, 500, 750, 750, 750, 750, 750, 1000, 1000, 
        1000, 500, 500, 500, 600, 600, 600, 600, 300, 300, 1000, 
        1000, 1000, 1100, 1100, 1000, 1000, 500, 500, 500, 500)
        .forEach(numberBindings -> {
          bindingsProject2.put(date2.get(), numberBindings);
          date2.set(date2.get() + 86400000);
        });

        put(ProjectIdentification.create("project-2", "project-id-2", 
          Long.parseLong("234567890123")), bindingsProject2);
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

  /** Retrieves the bindings data associated with {@code projectId} in the bindings table. */
  public static Map<Long, Integer> getDatesToBindingsForProject(String projectId) {
    AtomicReference<Map<Long, Integer>> dailyBindings = 
      new AtomicReference<Map<Long, Integer>>();
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
   */
  public static double getAvgBindingsForProject(String projectId) {
    Map<Long, Integer> dailyBindings = getDatesToBindingsForProject(projectId);

    if (dailyBindings.size() == 0) {
      return 0;
    }

    AtomicReference<Double> averageBindings = new AtomicReference<Double>();
    dailyBindings.forEach((date, bindings) -> {
      averageBindings.set(averageBindings.get() + bindings);
    });
    return averageBindings.get() / dailyBindings.size();
  }

  /** 
   * Returns a map of entries in the recommendations table associated with 
   * {@code projectId}. 
   */
  public static Map<Long, Recommendation> getDatesToRecommendationsForProject(
    String projectId) {
    return recommendations.entrySet().stream()
      .filter(mapElement -> 
      ((Recommendation) mapElement.getValue()).getProjectId().equals(projectId))
      .collect(Collectors.toMap(
        mapElement -> mapElement.getKey(), mapElement -> mapElement.getValue()));
  }
  
}