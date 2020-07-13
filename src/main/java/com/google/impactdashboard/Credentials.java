package com.google.impactdashboard;

import java.lang.RuntimeException;
import com.google.impactdashboard.configuration.Constants;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.appengine.AppEngineCredentials;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.ByteArrayInputStream;

/** 
 * A class for retrieving the proper credentials for the current environment in 
 * order to access the necessary APIs. 
 */
public class Credentials {

  /** 
   * Returns the proper credentials for the current environment. 
   * @throws RuntimeException if credentials fail to be assigned.
   */
  public static GoogleCredentials getCredentials() {

    GoogleCredentials credentials = null;

    if (assignLocalCredentials(credentials)) {
      return credentials;
    }
    if (assignGithubSecretCredentials(credentials)) {
      return credentials;
    }
    if (assignAppEngineCredentials(credentials)) {
      return credentials;
    }

    throw new RuntimeException("Unable to assign credentials");
  }

  private static boolean assignAppEngineCredentials(GoogleCredentials credentials) {
    try {
      credentials = AppEngineCredentials.getApplicationDefault();
    } catch (Exception e) {
      throw new RuntimeException(
        "Attempt to assign App Engine default credentials failed with unexpected error: " + 
          e.getMessage());
    }
    return true;
  }

  /**
   * Attempts to use an environment variable on Github to get credentials. If it 
   * succeeds, returns true. If it fails because the environment variable was not 
   * found (the code is not running on Github), returns false.
   * @param credentials The credentials to be set.
   * @return whether or not the assignment succeeded.
   * @throws RuntimeException if the assignment fails for any reason other than 
      the environment variable not being found.
   */
  private static boolean assignGithubSecretCredentials(GoogleCredentials credentials) {
    try {
      credentials = GoogleCredentials.fromStream(
        new ByteArrayInputStream(System.getenv("SERVICE_ACCOUNT_KEY").getBytes()));
    } catch (NullPointerException np) {
      return false;
    } catch (Exception e) {
      throw new RuntimeException(
        "Attempt to access Github secret credentials failed with unexpected error: " + 
          e.getMessage());
    }
    return true;
  }

  /** 
   * Attempts to use a local key file to get credentials. If it succeeds, returns 
   * true. If it fails because the file was not found, returns false. 
   * @param credentials The credentials to be set.
   * @return whether or not the assignment succeeded.
   * @throws RuntimeException if the assignment fails for any reason other than 
      an IOException. 
   */
  private static boolean assignLocalCredentials(GoogleCredentials credentials) {
    try {
      credentials = GoogleCredentials.fromStream(
        new FileInputStream(Constants.PATH_TO_SERVICE_ACCOUNT_KEY));
    } catch (IOException io) {
      return false;
    } catch (Exception e) {
      throw new RuntimeException(
        "Attempt to access local credentials failed with unexpected error: " + 
          e.getMessage());
    }
    return true;
  }
  
}