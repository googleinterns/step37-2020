package com.google.impactdashboard.database_manager.data_update;

import com.google.impactdashboard.constants.Configuration;

/** 
 * Class that returns either real DataUpdateManager that accesses the database, 
 * or a fake on for testing purposes. 
 */
public class DataUpdateManagerFactory {
  /** 
   * If useFakeDataUpdateManager is set to true, returns a fake implementation 
   * of DataUpdateManager. Otherwise returns a real implementation. 
   */
  public static DataUpdateManager create() {
    if (Configuration.useFakeDataUpdateManager) {
      return new DataUpdateManagerFake();
    } else {
      return new DataUpdateManagerImpl();
    }
  }
}
