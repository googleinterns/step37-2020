package com.google.impactdashboard.server.utilities;

/** Error message class that will be sent to frontend. */
public class ErrorMessage {

  private String message;
  private Throwable exception;

  public ErrorMessage(String message, Throwable exception) {
    this.message = message;
    this.exception = exception;
  }
}
