package com.google.impactdashboard.servlets;

import com.google.gson.Gson;
import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.server.ProjectInformationRetriever;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Servlet for retrieving the list of projects that the user has exported IAM data for.
 */
@WebServlet("/list-project-summaries")
public class ListProjectSummariesServlet extends HttpServlet {

  ProjectInformationRetriever projectInformationRetriever;

  /**
   * Method called by frontend to retrieve the projects that can be accessed.
   * @param response contains json representation of the names of the projects.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    if(projectInformationRetriever == null){
      projectInformationRetriever = new ProjectInformationRetriever(
          DataReadManagerFactory.create());
    }

    List<Project> projectList = projectInformationRetriever.listProjectInformation();
    // Separate class to handle database call
    // passes Project list json in response
    Gson gson = new Gson();
    String json = gson.toJson(projectList);
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }
}