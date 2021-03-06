package com.google.impactdashboard.servlets;

import com.google.gson.Gson;
import com.google.impactdashboard.data.organization.OrganizationGraphData;
import com.google.impactdashboard.data.project.ProjectGraphData;
import com.google.impactdashboard.server.OrganizationInformationRetriever;
import com.google.impactdashboard.server.ProjectInformationRetriever;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet for retrieving the data associated with a given project needed to be graphed in the
 * front end.
 */
@WebServlet("/get-organization-data")
public class GetOrganizationDataServlet extends HttpServlet {

  private OrganizationInformationRetriever organizationInformationRetriever;

  /**
   * Handles the creation of the server classes the first time the servlet is run.
   */
  @Override
  public void init() {
    organizationInformationRetriever = OrganizationInformationRetriever.create();
   }

  /**
   * Method called by the frontend to get the data needed to graph a projects information.
   * @param request contains the project data is requested for.
   * @param response contains json representation of information to graph.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String projectId = request.getParameter("id");

    OrganizationGraphData graphData = organizationInformationRetriever.getOrganizationData(projectId);

    Gson gson = new Gson();
    String json = gson.toJson(graphData);
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }
}
