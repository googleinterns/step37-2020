package com.google.impactdashboard.resourcemanager.api_utility;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.cloudresourcemanager.CloudResourceManager;
import com.google.api.services.cloudresourcemanager.model.Folder;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.impactdashboard.resourcemanager.Credentials;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;

public class FolderInfoRetriever {

  private CloudResourceManager cloudResourceManagerService;

  protected FolderInfoRetriever(CloudResourceManager cloudResourceManagerService) {
    this.cloudResourceManagerService = cloudResourceManagerService;
  }

  /**
   * Factory method for creating a new instance of FolderInfoRetriever.
   * @return A new instance of FolderInfoRetriever
   */
  public static FolderInfoRetriever create() {
    return new FolderInfoRetriever(createCloudResourceManagerService());
  }

  /**
   * Returns a CloudResourceManager with the proper credentials to retrieve the
   * list of projects that the dashboard has access to.
   */
  private static CloudResourceManager createCloudResourceManagerService() {
    HttpTransport httpTransport = null;
    try {
      httpTransport = GoogleNetHttpTransport.newTrustedTransport();
    } catch (IOException io) {
      throw new RuntimeException(
          "Failed to access Resource Manager: could not create HttpTransport, " + io.getMessage());
    } catch (GeneralSecurityException ge) {
      throw new RuntimeException(
          "Failed to access Resource Manager: could not create HttpTransport, " + ge.getMessage());
    }
    JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();

    HttpCredentialsAdapter credentials = new HttpCredentialsAdapter(
        Credentials.getCredentials()
            .createScoped(Arrays.asList("https://www.googleapis.com/auth/cloud-platform")));

    return new CloudResourceManager.Builder(httpTransport, jsonFactory, credentials)
        .setApplicationName("Recommendations Impact Dashboard")
        .build();
  }

  public Folder getFolder(String folderId) throws IOException {
    return cloudResourceManagerService.folders().get("folders/" + folderId).execute();
  }


  public static void main(String[] args) throws IOException {
    FolderInfoRetriever retriever = create();
    Folder folder = retriever.getFolder("261046259366");
  }
}
