package com.google.impactdashboard.data.recommendation;

import com.google.auto.value.AutoValue;

/** Represents an action taken by a GCP Recommendation. */
@AutoValue
public abstract class RecommendationAction {

  public abstract String getAffectedAccount();
  public abstract String getPreviousRole();
  public abstract String getNewRole();
  public abstract ActionType getActionType();

  public enum ActionType {
    REMOVE_ROLE,
    REPLACE_ROLE
  }

  /** 
   * Creates a {@code RecommendationAction} representing an action of type 
   * {@code actionType} taken by a GCP Recommendation that changed the role of 
   * user {@code affectedAccount} from {@code previousRole} to {@code newRole}. 
   * If the user's role was removed instead of replaced, then {@code newRole} 
   * should be the empty string. 
   */
  public static RecommendationAction create(String affectedAccount, String previousRole, 
    String newRole, ActionType actionType)  {
    return new AutoValue_RecommendationAction(affectedAccount, previousRole, newRole, actionType);
  }
}
