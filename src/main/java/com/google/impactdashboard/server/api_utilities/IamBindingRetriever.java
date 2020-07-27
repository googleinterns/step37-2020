package com.google.impactdashboard.server.api_utilities;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.iam.v1.Iam;
import com.google.api.services.iam.v1.IamScopes;
import com.google.api.services.iam.v1.model.ListRolesResponse;
import com.google.api.services.iam.v1.model.Role;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.cloud.audit.AuditLog;
import com.google.impactdashboard.Credentials;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.impactdashboard.data.project.ProjectIdentification;
import com.google.impactdashboard.data.recommendation.RecommendationAction;
import com.google.logging.v2.LogEntry;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.Timestamp;
import com.google.protobuf.Value;

import java.util.AbstractMap.SimpleImmutableEntry;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Class that counts number of members in each IAM role and determines the total number of bindings.
 */
public class IamBindingRetriever {

  private final Iam iamService;
  private final List<Role> roles;

  protected IamBindingRetriever(Iam iamService, 
      ProjectListRetriever projectRetriever) throws IOException {
    this.iamService = iamService;

    List<ProjectIdentification> projects = projectRetriever.listResourceManagerProjects();
    roles = new ArrayList<>();
    String pageToken = null;
    do {
      ListRolesResponse rolesResponse;
      if(pageToken == null) {
        rolesResponse = iamService.roles().list().setView("full").execute();
      } else {
        rolesResponse = iamService.roles().list().setView("full").setPageToken(pageToken).execute();
      }
      roles.addAll(rolesResponse.getRoles());
      pageToken = rolesResponse.getNextPageToken();
    } while(pageToken != null);
  }

  /**
   * Static factory for creating a new instance of IamBindingRetriever.
   * @return new Instance of IamBindingRetriever
   */
  public static IamBindingRetriever create() throws IOException, GeneralSecurityException {
    Iam iamService = new Iam.Builder(GoogleNetHttpTransport.newTrustedTransport(),
        JacksonFactory.getDefaultInstance(),
        new HttpCredentialsAdapter(Credentials.getCredentials().createScoped(Collections
            .singleton(IamScopes.CLOUD_PLATFORM))))
        .setApplicationName("Recommendation Impact Dashboard")
        .build();
    ProjectListRetriever projectListRetriever = ProjectListRetriever.getInstance();

    return new IamBindingRetriever(iamService, projectListRetriever);
  }

  /**
   * Takes audit logs and uses the IAM API with the bindings from the audit logs to
   * calculate the IAMBindingsNumber for Each log.
   * @param logEntries List of audit logs that set IAM policy
   * @return the Database entries of IAMBindings from the audit logs
   */
  public List<IAMBindingDatabaseEntry> listIAMBindingData(Collection<LogEntry> logEntries,
                                      String projectId, String projectName,
                                      String projectNumber, Long timeStamp){
    Map<Timestamp, AuditLog> timeToAuditLogMap = logEntries.stream().map(log -> {
          AuditLog auditLog;
          try {
            auditLog = AuditLog.parseFrom(log.getProtoPayload().getValue());
          } catch (InvalidProtocolBufferException e) {
            throw new RuntimeException("Invalid Protocol Buffer used");
          }
          return new SimpleImmutableEntry<>(log.getTimestamp(), auditLog);
        }).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    return timeToAuditLogMap.entrySet().stream().map(entry -> {
      Long secondsFromEpoch = timeStamp;
      Map<String, Integer> membersForRoles = getMembersForRoles(entry.getValue().getResponse()
          .getFieldsMap().get("bindings").getListValue().getValuesList());
      if(secondsFromEpoch == null){
        secondsFromEpoch = entry.getKey().getSeconds() * 1000;
      }
      return IAMBindingDatabaseEntry.create(projectId, projectName, projectNumber, secondsFromEpoch,
          getIamBindings(membersForRoles, projectId));
    }).collect(Collectors.toList());
  }

  /**
   * Takes in a map of protobuf value to value and updates the mapRoleToNumberOfMembers field with the new
   * role and the number of members in the role.
   * @param bindings protoBuf map for a binding map from AuditLogs
   */
  private Map<String, Integer> getMembersForRoles(List<Value> bindings) {

    Map<String, Integer> membersforRoles = new HashMap<>();
    bindings.forEach(bindingValue -> {
      Map<String, Value> bindingMap = bindingValue.getStructValue().getFieldsMap();
      membersforRoles.put(bindingMap.get("role").getStringValue(),
          bindingMap.get("members").getListValue().getValuesList().size());
    });
    return membersforRoles;
  }

  /**
   * Calls IAM API to get all roles for a project and then calculate the IAM bindings for the given map.
   * @param membersForRoles map of membersPerRole to calculate the number of total bindings.
   * @return Total number of IAMBindings for the given map
   */
  private int getIamBindings(Map<String, Integer> membersForRoles, String projectId) {
    List<String> unknownRoles = membersForRoles.keySet().stream()
        .filter(role ->
            !roles.stream().reduce(false, (accumulator, knownRole) ->
                accumulator || role.equals(knownRole.getName()), Boolean::logicalOr))
        .collect(Collectors.toList());
    if (unknownRoles.size() > 0) {
      throw new RuntimeException("Unknown roles in this project! " + String.join(", ",unknownRoles));
    }

    return roles.stream().filter(role -> membersForRoles.containsKey(role.getName()))
        .mapToInt(role -> {
          if(role.getIncludedPermissions() != null) {
            return role.getIncludedPermissions().size() * membersForRoles.get(role.getName());
          } else {
            return 0;
          }
        }).sum();
  }

  /**
   * Helper method for retrieving all the project level custom roles for a specified project.
   * @param projectId the project id of the project to receive custom roles for.
   * @return a list of all the custom roles available to the project specified by projectId.
   */
  private List<Role> getProjectCustomRoles(String projectId) throws IOException {
    List<Role> projectCustomRoles = new ArrayList<>();
    String projectPageToken = null;
    do {
      ListRolesResponse rolesResponse;
      if(projectPageToken == null) {
        rolesResponse = iamService.projects().roles().list("projects/" + projectId)
            .setView("full").execute();
      } else {
        rolesResponse = iamService.projects().roles().list("projects/" + projectId)
            .setView("full").setPageToken(projectPageToken).execute();
      }
      projectCustomRoles.addAll(rolesResponse.getRoles());
      projectPageToken = rolesResponse.getNextPageToken();
    } while(projectPageToken != null);

      throw new UnsupportedOperationException("Not yet implmented!");
  }

  /**
   * Retrieves Iam roles from Iam API using the roles within the action and determines the impact
   * on total number of bindings for the actions.
   * @param actions The actions that the impact needs to be calculated for
   * @return The difference in the number of bindings the two roles have.
   */
  public int getActionImpact(List<RecommendationAction> actions){
    return actions.stream().mapToInt(action -> {
      try {
        Role previousRole = iamService.roles().get(action.getPreviousRole()).execute();
        String newRoleString = action.getNewRole();
        if (!newRoleString.isEmpty()) {
          Role newRole = iamService.roles().get(newRoleString).execute();
          return Math.abs(previousRole.getIncludedPermissions().size() -
              newRole.getIncludedPermissions().size());
        }
        return previousRole.getIncludedPermissions().size();
      } catch (IOException e) {
        throw new RuntimeException("Role could not be retrieved!");
      }
    }).sum();
  }
}
