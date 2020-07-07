package com.google.impactdashboard.database_manager.data_read;

import com.google.impactdashboard.configuration.Configuration;
import java.io.IOException;

/** 
 * Class for returning either a real DataReadManager or a fake one depending on 
 * configuration flags. 
 */
public class DataReadManagerFactory {
  
  /** 
   * If {@code useFakeDataReadManager} is set to true, then returns a fake DataReadManager 
   * for testing purposes, otherwise returns a real DataReadManager that actually
   * accesses the database. 
   */
  public static DataReadManager create() throws IOException {
    if (Configuration.useFakeDataReadManager) {
      return new DataReadManagerFake();
    } else {
      return new DataReadManagerImpl();
    }
  }
}
