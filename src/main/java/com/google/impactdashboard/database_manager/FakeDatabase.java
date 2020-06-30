package com.google.impactdashboard.database_manager;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import com.google.impactdashboard.data.recommendation.*;
import java.util.concurrent.atomic.AtomicReference;

public class FakeDatabase {
  private static Map<Long, Recommendation> recommendations = 
    new HashMap<Long, Recommendation>() {
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

  private static HashMap<String, HashMap<Long, Integer>> iamBindings = 
    new HashMap<String, HashMap<Long, Integer>>() {
      {
        HashMap<Long, Integer> bindingsProject1 = new HashMap<Long, Integer>();
        AtomicReference<Long> date = new AtomicReference<Long>(Long.parseLong("1590883200000"));

        Arrays.asList(1000, 1000, 1000, 2000, 2050, 2150, 2150, 2150, 2150, 
        1150, 1150, 1150, 1150, 2000, 2000, 2500, 2500, 2300, 2300, 1000, 
        1000, 1000, 1100, 1100, 1000, 1000, 1300, 1300, 1350, 1350)
        .forEach(numberBindings -> {
          bindingsProject1.put(date.get(), numberBindings);
          date.set(date.get() + 86400000);
        });

        put("project-id-1", bindingsProject1);

        HashMap<Long, Integer> bindingsProject2 = new HashMap<Long, Integer>();
        date = new AtomicReference<Long>(Long.parseLong("1590883200000"));

        Arrays.asList(500, 500, 750, 750, 750, 750, 750, 1000, 1000, 
        1000, 500, 500, 500, 600, 600, 600, 600, 300, 300, 1000, 
        1000, 1000, 1100, 1100, 1000, 1000, 500, 500, 500, 500)
        .forEach(numberBindings -> {
          bindingsProject2.put(date.get(), numberBindings);
          date.set(date.get() + 86400000);
        });

        put("project-id-1", bindingsProject2);
      }
  };

  
}