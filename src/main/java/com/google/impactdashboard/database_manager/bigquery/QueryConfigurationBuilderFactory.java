package com.google.impactdashboard.database_manager.bigquery;

import com.google.impactdashboard.configuration.Configuration;

/** 
 * A class for retrieving an implementation of QueryConfigurationBuilder that 
 * retrieves query configuration builders that either query the real database or 
 * a test database, depending on the system configuration flags. 
 */
public class QueryConfigurationBuilderFactory {

  /** 
   * If {@code Configuration.useTestDatabase} is set to true, then returns a 
   * QueryConfigurationBuilder that retrieves query configuration builders that 
   * query the test database. Otherwise returns a QueryConfigurationBuilder that 
   * retrieves query configuration bulders that query the real database.
   */
  public static QueryConfigurationBuilder create() {
    if (Configuration.useTestDatabase) {
      return QueryConfigurationBuilderFake.getInstance();
    } else {
      return QueryConfigurationBuilderImpl.getInstance();
    }
  }
  
}