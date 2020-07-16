package com.google.impactdashboard.server.api_utilities;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.cloudresourcemanager.CloudResourceManager;
import com.google.api.services.cloudresourcemanager.model.ListProjectsResponse;
import com.google.api.services.cloudresourcemanager.model.Project;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.impactdashboard.Credentials;

public class ProjectListRetriever {

  /**
   * Need: function that will get list project identification objects 
   */

   public static void main(String[] args) throws Exception {
    CloudResourceManager cloudResourceManagerService = createCloudResourceManagerService();
    CloudResourceManager.Projects.List request = cloudResourceManagerService.projects().list();

    ListProjectsResponse response;
    do {
      response = request.execute();
      if (response.getProjects() == null) {
        continue;
      }
      for (Project project : response.getProjects()) {
        System.out.println(project);
      }
      request.setPageToken(response.getNextPageToken());
    } while (response.getNextPageToken() != null);
  }


  public static CloudResourceManager createCloudResourceManagerService()
      throws IOException, GeneralSecurityException {
    HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
    JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();

    HttpCredentialsAdapter credentials = new HttpCredentialsAdapter(Credentials.getCredentials().createScoped(Arrays.asList("https://www.googleapis.com/auth/cloud-platform")));

    // GoogleCredential credential = GoogleCredential.getApplicationDefault();
    // if (credential.createScopedRequired()) {
    //   credential =
    //       credential.createScoped(Arrays.asList("https://www.googleapis.com/auth/cloud-platform"));
    // }

    return new CloudResourceManager.Builder(httpTransport, jsonFactory, credentials)
       // .setApplicationName("Google-CloudResourceManagerSample/0.1")
        .build();
  }
   
  
}