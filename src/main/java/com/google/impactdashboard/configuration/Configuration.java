package com.google.impactdashboard.configuration;

/** A class containing configurations that detail how code should be run. */
public class Configuration {

  /** 
   * When set to true, a call to DataReadManagerFactory.create() will return a 
   * fake of DataReadManager for testing purposes. 
   */
  public static boolean useFakeDataReadManager = false; 

  /** 
   * When set to true, a call to DataUpdateManagerFactory.create() will return a 
   * fake of DataUpdateManager for testing purposes. 
   */
  public static boolean useFakeDataUpdateManager = false; 

  /** 
   * When set to true, DatabaseAccessor will access a small test database for 
   * testing purposes instead of the real database.  
   */
  public static boolean useTestDatabase = false;

  /**
   * When set to true, DatabaseAccessor will access a test database where all 
   * the tables are empty. Takes precedence over {@code useTestDatabase}.
   */
  public static boolean useEmptyDatabase = true;
}
