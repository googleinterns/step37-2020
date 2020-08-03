package com.google.impactdashboard.configuration;

/** A class to hold the column names in the IAM Bindings Table. */
public class IAMBindingsSchema {
  /** The name of the column holding the project id. */
  public static final String IAM_PROJECT_ID_COLUMN = "ProjectId";

  /** The name of the column holding the name of the project. */
  public static final String PROJECT_NAME_COLUMN = "ProjectName";

  /** The name of the column holding the number of the project. */
  public static final String PROJECT_NUMBER_COLUMN = "ProjectNumber";

  /** The name of the column holding the project id. */
  public static final String IAM_ORGANIZATION_ID_COLUMN = "OrganizationId";

  /** The name of the column holding the name of the project. */
  public static final String ORGANIZATION_NAME_COLUMN = "OrganizationName";

  /** The name of the column holding the timestamp of the bindings data. */
  public static final String TIMESTAMP_COLUMN = "Timestamp";

  /** The name of the column holding the number of IAM Bindings. */
  public static final String NUMBER_BINDINGS_COLUMN = "NumberOfBindings";
}
