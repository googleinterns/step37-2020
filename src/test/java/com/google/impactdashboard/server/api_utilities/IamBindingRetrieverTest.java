package com.google.impactdashboard.server.api_utilities;

import com.google.api.services.iam.v1.Iam;
import com.google.api.services.iam.v1.model.ListRolesResponse;
import com.google.api.services.iam.v1.model.Role;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.*;

@RunWith(JUnit4.class)
public class IamBindingRetrieverTest extends Mockito {

  private static final String TEST_PROJECT_ID = "test-project";
  private static final String PROJECT_CUSTOM_ROLE_NAME = "projects/project-customRole";
  private static final List<String> INCLUDED_PERMISSIONS_PROJECT = Arrays.asList("test-testpermissions1",
      "test-testpermission2");
  private static final Role CUSTOM_PROJECT_ROLE = new Role()
      .setIncludedPermissions(INCLUDED_PERMISSIONS_PROJECT).setName(PROJECT_CUSTOM_ROLE_NAME);
  private static final int PROJECT_MEMBERS = 12;

  private static final List<String> INCLUDED_PERMISSIONS_ORG = Arrays.asList("test-testpermissions1",
      "test-testpermission2", "test-testpermission3");
  private static final String ORG_CUSTOM_ROLE_NAME = "organizations/org-customRole";
  private static final Role CUSTOM_ORG_ROLE = new Role().setIncludedPermissions(INCLUDED_PERMISSIONS_ORG)
      .setName(ORG_CUSTOM_ROLE_NAME);
  private static final int ORGANIZATION_MEMBERS = 3;

  private static final List<String> INCLUDED_PERMISSIONS_GENERIC = Arrays.asList("genericRole1", "genericRole2",
      "genericRole3");
  private static final String GENERIC_ROLE_NAME = "generic";
  private static final Role GENERIC_ROLE = new Role()
      .setIncludedPermissions(INCLUDED_PERMISSIONS_GENERIC).setName(GENERIC_ROLE_NAME);
  private static final int GENERIC_MEMBERS = 20;
  private static final Map<String, Integer> MEMBERS_FOR_ROLES = new HashMap<>();

  private Iam mockIamService;
  private IamBindingRetriever iamBindingRetriever;
  private ResourceRetriever mockResourceRetriever;

  @Before
  public void setup() throws IOException {
    mockIamService = mock(Iam.class, Mockito.RETURNS_DEEP_STUBS);
    mockResourceRetriever = mock(ResourceRetriever.class);

    ListRolesResponse mockGenericRoleResponse = mock(ListRolesResponse.class);
    when(mockIamService.roles().list().setView(eq("full")).execute()).thenReturn(mockGenericRoleResponse);
    when(mockGenericRoleResponse.getRoles()).thenReturn(Collections.singletonList(GENERIC_ROLE));

    MEMBERS_FOR_ROLES.put(GENERIC_ROLE_NAME, GENERIC_MEMBERS);
    iamBindingRetriever = new IamBindingRetriever(mockIamService, mockResourceRetriever);
  }

  @Test
  public void testCustomProjectRole() throws IOException {
    // Tests to see if custom role on the project level are counted correctly
    ListRolesResponse mockOrganizationRoleResponse = mock(ListRolesResponse.class);
    ListRolesResponse mockProjectRoleResponse = mock(ListRolesResponse.class);

    when(mockIamService.organizations().roles().list(anyString()).setView(eq("full")).execute())
        .thenReturn(mockOrganizationRoleResponse);
    when(mockIamService.projects().roles().list(anyString()).setView(eq("full")).execute())
        .thenReturn(mockProjectRoleResponse);


    when(mockProjectRoleResponse.getRoles()).thenReturn(Collections
        .singletonList(CUSTOM_PROJECT_ROLE));
    when(mockOrganizationRoleResponse.getRoles()).thenReturn(Collections.emptyList());

    MEMBERS_FOR_ROLES.put(PROJECT_CUSTOM_ROLE_NAME, PROJECT_MEMBERS);

    int actual = iamBindingRetriever.getIamBindings(MEMBERS_FOR_ROLES, TEST_PROJECT_ID);
    int expected = PROJECT_MEMBERS * INCLUDED_PERMISSIONS_PROJECT.size() +
        GENERIC_MEMBERS * INCLUDED_PERMISSIONS_GENERIC.size();

    Assert.assertEquals(expected, actual);
  }

  @Test
  public void testCustomOrganizationRole() throws IOException {
    // Tests to see if custom roles on the organization level are counted correctly
    ListRolesResponse mockOrganizationRoleResponse = mock(ListRolesResponse.class);
    ListRolesResponse mockProjectRoleResponse = mock(ListRolesResponse.class);

    when(mockIamService.organizations().roles().list(anyString()).setView(eq("full")).execute())
        .thenReturn(mockOrganizationRoleResponse);
    when(mockIamService.projects().roles().list(anyString()).setView(eq("full")).execute())
        .thenReturn(mockProjectRoleResponse);


    when(mockOrganizationRoleResponse.getRoles()).thenReturn(Collections.singletonList(CUSTOM_ORG_ROLE));
    when(mockProjectRoleResponse.getRoles()).thenReturn(Collections.emptyList());

    MEMBERS_FOR_ROLES.put(ORG_CUSTOM_ROLE_NAME, ORGANIZATION_MEMBERS);

    int actual = iamBindingRetriever.getIamBindings(MEMBERS_FOR_ROLES, TEST_PROJECT_ID);
    int expected = ORGANIZATION_MEMBERS * INCLUDED_PERMISSIONS_ORG.size() +
        GENERIC_MEMBERS * INCLUDED_PERMISSIONS_GENERIC.size();

    Assert.assertEquals(expected, actual);
  }

  @Test
  public void noCustomRoles() throws IOException {
    // Tests to see if custom roles on the organization level are counted correctly
    ListRolesResponse mockOrganizationRoleResponse = mock(ListRolesResponse.class);
    ListRolesResponse mockProjectRoleResponse = mock(ListRolesResponse.class);

    when(mockIamService.organizations().roles().list(anyString()).setView(eq("full")).execute())
        .thenReturn(mockOrganizationRoleResponse);
    when(mockIamService.projects().roles().list(anyString()).setView(eq("full")).execute())
        .thenReturn(mockProjectRoleResponse);


    when(mockOrganizationRoleResponse.getRoles()).thenReturn(Collections.emptyList());
    when(mockProjectRoleResponse.getRoles()).thenReturn(Collections.emptyList());

    int actual = iamBindingRetriever.getIamBindings(MEMBERS_FOR_ROLES, TEST_PROJECT_ID);
    int expected = GENERIC_MEMBERS * INCLUDED_PERMISSIONS_GENERIC.size();

    Assert.assertEquals(expected, actual);
  }
}
