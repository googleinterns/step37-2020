package com.google.impactdashboard.servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet for retrieving the data associated with a given project needed to be graphed in the
 * front end.
 */
@WebServlet("/get-project-data")
public class GetProjectDataServlet extends HttpServlet {

  /**
   * Method called by the frontend to get the data needed to graph a projects information.
   * @param request contains the project data is requested for.
   * @param response contains json representation of information to graph.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String projectId = request.getParameter("id");

  }
}
