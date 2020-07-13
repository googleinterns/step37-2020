package com.google.impactdashboard;

import java.lang.RuntimeException;
import com.google.impactdashboard.configuration.Constants;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.appengine.AppEngineCredentials;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.util.concurrent.atomic.AtomicReference;

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

    AtomicReference<GoogleCredentials> credentials = new AtomicReference<GoogleCredentials>();

    if (assignLocalCredentials(credentials)) {
      return credentials.get();
    }
    if (assignGithubSecretCredentials(credentials)) {
      return credentials.get();
    }
    if (assignAppEngineCredentials(credentials)) {
      return credentials.get();
    }

    throw new RuntimeException("Unable to assign credentials");
  }

  /**
   * Attempts to use the default AppEngine credentials. If it succeeds, returns true.
   * @param credentials The credentials to be set.
   * @return whether or not the assignment succeeded.
   * @throws RuntimeException if the assignment fails for any reason.
   */
  private static boolean assignAppEngineCredentials(
    AtomicReference<GoogleCredentials> credentials) {
    try {
      credentials.set(AppEngineCredentials.getApplicationDefault());
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
  private static boolean assignGithubSecretCredentials(
    AtomicReference<GoogleCredentials> credentials) {
    try {
      credentials.set(GoogleCredentials.fromStream(
        new ByteArrayInputStream(System.getenv("SERVICE_ACCOUNT_KEY").getBytes())));
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
  private static boolean assignLocalCredentials(
    AtomicReference<GoogleCredentials> credentials) {
    try {
      credentials.set(GoogleCredentials.fromStream(
        new FileInputStream(Constants.PATH_TO_SERVICE_ACCOUNT_KEY)));
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