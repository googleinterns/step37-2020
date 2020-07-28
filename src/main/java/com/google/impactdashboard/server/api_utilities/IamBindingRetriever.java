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

  protected IamBindingRetriever(Iam iamService) throws IOException {
    this.iamService = iamService;

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

    return new IamBindingRetriever(iamService);
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
      int iamBindings = 0;
      try {
        iamBindings = getIamBindings(membersForRoles, projectId);
      } catch (IOException e) {
        throw new RuntimeException("IAM Bindings not received.");
      }
      return IAMBindingDatabaseEntry.create(projectId, projectName, projectNumber, secondsFromEpoch,
          iamBindings);
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
   * Returns all organization ids associated with organization-level roles in 
   * the map of roles to members. 
   */
  private List<String> getUnknownOrganizationIds(Map<String, Integer> membersForRoles) {
    return membersForRoles.keySet().stream()
        .filter(role ->
            !roles.stream().reduce(false, (accumulator, knownRole) ->
                accumulator || role.equals(knownRole.getName()), Boolean::logicalOr))
        .map(role -> {
          List<String> items = Arrays.asList(role.split("\\s*/\\s*"));
          if (!items.get(0).equals("organizations")) {
            return "";
          }
          return items.get(1);
        })
        .filter(role -> !role.equals(""))
        .collect(Collectors.toList());
  }

  /**
   * Calls IAM API to get all roles for a project and then calculate the IAM bindings for the given map.
   * @param membersForRoles map of membersPerRole to calculate the number of total bindings.
   * @return Total number of IAMBindings for the given map
   */
  private int getIamBindings(Map<String, Integer> membersForRoles, String projectId) throws IOException {
    int iamBindings = roles.stream().filter(role -> membersForRoles.containsKey(role.getName()))
        .mapToInt(role -> {
          if(role.getIncludedPermissions() != null) {
            return role.getIncludedPermissions().size() * membersForRoles.get(role.getName());
          } else {
            return 0;
          }
        }).sum();

    iamBindings += getProjectCustomRoles(projectId).stream()
        .filter(role -> membersForRoles.containsKey(role.getName())).mapToInt(role -> {
          if(role.getIncludedPermissions() != null) {
            return role.getIncludedPermissions().size() * membersForRoles.get(role.getName());
          } else {
            return 0;
          }
        }).sum();

    iamBindings += getUnknownOrganizationIds(membersForRoles).stream().reduce(0, 
        (accumulator, organizationId) -> accumulator + 
            getOrganizationCustomRoles(organizationId).stream()
                .filter(role -> membersForRoles.containsKey(role.getName()))
                .mapToInt(role -> {
                    if(role.getIncludedPermissions() != null) {
                    return role.getIncludedPermissions().size() * 
                        membersForRoles.get(role.getName());
                    } else {
                      return 0;
                    }
                })
                .sum(), 
        Math::addExact);

    return iamBindings;
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
      if (rolesResponse != null) {
        projectCustomRoles.addAll(rolesResponse.getRoles());
        projectPageToken = rolesResponse.getNextPageToken();
      }
    } while(projectPageToken != null);

    return projectCustomRoles;
  }

  /**
   * Helper method for retrieving all the organization level custom roles for a specified project.
   * @param organizationId the organization id of the organization to receive custom roles for.
   * @return a list of all the custom roles available to the project specified by projectId.
   */
  private List<Role> getOrganizationCustomRoles(String organizationId) {
    List<Role> organizationCustomRoles = new ArrayList<>();
    String projectPageToken = null;
    try {
      do {
        ListRolesResponse rolesResponse;
        if(projectPageToken == null) {
          rolesResponse = iamService.organizations().roles().list("organizations/" + organizationId)
              .setView("full").execute();
        } else {
          rolesResponse = iamService.projects().roles().list("organizations/" + organizationId)
              .setView("full").setPageToken(projectPageToken).execute();
        }
        if (rolesResponse != null) {
          organizationCustomRoles.addAll(rolesResponse.getRoles());
          projectPageToken = rolesResponse.getNextPageToken();
        }
      } while(projectPageToken != null);

      return organizationCustomRoles;
    } catch (IOException e) {
      System.err.println("WARNING: Credentials cannot access org-level roles" + 
          " for organization " + organizationId + 
          ". Bindings calculations will be affected.");
      return Arrays.asList();
    }
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
