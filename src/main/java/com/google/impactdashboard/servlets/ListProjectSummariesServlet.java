package com.google.impactdashboard.servlets;

import com.google.api.services.cloudresourcemanager.CloudResourceManager;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet for retrieving the list of projects that the user has exported IAM data for.
 */
@WebServlet("/list-project-summaries")
public class ListProjectSummariesServlet extends HttpServlet {
  /**
   * Method called by frontend to retrieve the projects that can be accessed.
   * @param response contains json representation of the names of the projects.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    throw new UnsupportedOperationException("Not Implemented");
  }
}
