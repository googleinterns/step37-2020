package com.google.impactdashboard.database_manager.data_read;

import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.IAMRecommenderMetadata;
import com.google.impactdashboard.data.recommendation.Recommendation;
import java.util.List;
import java.util.Arrays;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.atomic.AtomicReference;

/** Class for returning data from the database. */
public class DataReadManagerImpl implements DataReadManager {
  
  /** 
   *  Returns a list containing identifying information for all projects in the 
   *  IAM Bindings table.  
   */
  @Override
  public List<ProjectIdentification> listProjects() {
    return Arrays.asList( 
      ProjectIdentification.create("project-1", "project-id-1", Long.parseLong("123456789123")), 
      ProjectIdentification.create("project-2", "project-id-2", Long.parseLong("234567890123")));
  }

  /** 
   *  Returns the average number of IAM bindings that the project with id 
   *  {@code projectId} had per day over the past 365 days (or, if there are 
   *  not 365 days of data in the IAM Bindings table, the average over however 
   *  many days of data are in the table). 
   */
  @Override
  public double getAverageIAMBindingsInPastYear(String projectId) {
    if (projectId.equals("project-id-1")) {
      return 1545;
    } else if (projectId.equals("project-id-2")) {
      return 715;
    }
    return 0;
  }

  /**
   *  Returns a map of dates (as timestamps in UTC milliseconds since the epoch) 
   *  to the Recommendation applied on that date to the project with id {@code projectId}.
   */
  @Override
  public Map<Long, Recommendation> getMapOfDatesToRecommendationTaken(String projectId) {
    HashMap<Long, Recommendation> datesToRecommendations = new HashMap<Long, Recommendation>(); 

    if (projectId.equals("project-id-1")) {
      datesToRecommendations.put(Long.parseLong("1591633823000"), 
        Recommendation.create("project-id-1", 
          "remove unused permissions from user account test@google.com", 
          Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1591633823000"), 
          IAMRecommenderMetadata.create(1000)));    
      datesToRecommendations.put(Long.parseLong("1592486585000"), 
        Recommendation.create("project-id-1", 
          "remove unused permissions from user account test2@google.com", 
          Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1592486585000"), 
          IAMRecommenderMetadata.create(1000)));  
      datesToRecommendations.put(Long.parseLong("1592486705000"), 
        Recommendation.create("project-id-1", 
          "remove unused permissions from user account test3@google.com", 
          Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1592486705000"), 
          IAMRecommenderMetadata.create(300)));      
    } else if (projectId.equals("project-id-2")) {
      datesToRecommendations.put(Long.parseLong("1591704613000"), 
        Recommendation.create("project-id-2", 
          "remove unused permissions from user account test4@google.com", 
          Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1591704613000"), 
          IAMRecommenderMetadata.create(500)));    
      datesToRecommendations.put(Long.parseLong("1593072312000"), 
        Recommendation.create("project-id-2", 
          "remove unused permissions from user account test5@google.com", 
          Recommendation.RecommenderType.IAM_BINDING, Long.parseLong("1593072312000"), 
          IAMRecommenderMetadata.create(350)));    
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
    HashMap<Long, Integer> datesToBindings = new HashMap<Long, Integer>();
    AtomicReference<Long> date = new AtomicReference<Long>(Long.parseLong("1590883200000"));

    if (projectId.equals("project-id-1")) {
      Arrays.asList(1000, 1000, 1000, 2000, 2050, 2150, 2150, 2150, 2150, 
        1150, 1150, 1150, 1150, 2000, 2000, 2500, 2500, 2300, 2300, 1000, 
        1000, 1000, 1100, 1100, 1000, 1000, 1300, 1300, 1350, 1350)
        .forEach(numberBindings -> {
          datesToBindings.put(date.get(), numberBindings);
          date.set(date.get() + 86400000);
        });
    } else if (projectId.equals("project-id-2")) {
      Arrays.asList(500, 500, 750, 750, 750, 750, 750, 1000, 1000, 
        1000, 500, 500, 500, 600, 600, 600, 600, 300, 300, 1000, 
        1000, 1000, 1100, 1100, 1000, 1000, 500, 500, 500, 500)
        .forEach(numberBindings -> {
          datesToBindings.put(date.get(), numberBindings);
          date.set(date.get() + 86400000);
        });
    }

    return datesToBindings;
  }
}
