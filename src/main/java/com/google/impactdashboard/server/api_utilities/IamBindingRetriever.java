package com.google.impactdashboard.server.api_utilities;

import com.google.api.services.iam.v1.Iam;
import com.google.cloud.audit.AuditLog;
import com.google.impactdashboard.data.IAMBindingDatabaseEntry;
import com.google.logging.v2.LogEntry;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.MapField;
import com.google.protobuf.Value;
import com.google.protobuf.util.Values;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Class that counts number of members in each IAM role and determines the total number of bindings
 */
public class IamBindingRetriever {

  private final Map<String, Integer> mapRoleToNumberOfMembers;

  protected IamBindingRetriever( Map<String, Integer> mapRoleToNumberOfMembers) {
    this.mapRoleToNumberOfMembers = mapRoleToNumberOfMembers;
  }

  /**
   * Static factory for creating a new instance of IamBindingRetriever
   * @return new Instance of IamBindingRetriever
   */
  public static IamBindingRetriever create() {
    return new IamBindingRetriever(new HashMap<>());
  }

  public List<IAMBindingDatabaseEntry> listIAMBindingData(Collection<LogEntry> logEntries) {
    List<AuditLog> auditLogs = logEntries.stream().map(log -> {
     try {
       return AuditLog.parseFrom(log.getProtoPayload().getValue());
     } catch (InvalidProtocolBufferException e) {
       throw new RuntimeException("Invalid Protocol Buffer used");
     }
    }).collect(Collectors.toList());
    auditLogs.forEach(auditLog -> {
      getMembersForRoles(auditLog.getResponse().getFieldsMap().get("bindings").getListValue()
          .getValuesList());
    });
    throw new UnsupportedOperationException("Not fully implemented");
  }

  /**
   * Takes in a map of protobuf value to value and updates the mapRoleToNumberOfMembers field with the new
   * role and the number of members in the role
   * @param bindings protoBuf map for a binding map from AuditLogs
   */
  private void getMembersForRoles(List<Value> bindings) {
    bindings.forEach(bindingValue -> {
      Map<String, Value> bindingMap = bindingValue.getStructValue().getFieldsMap();
      mapRoleToNumberOfMembers.put(bindingMap.get("role").getStringValue(),
          bindingMap.get("member").getListValue().getValuesList().size());
    });
  }
}
