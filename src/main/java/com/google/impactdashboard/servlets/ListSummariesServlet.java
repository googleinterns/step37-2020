package com.google.impactdashboard.servlets;

import com.google.gson.Gson;
import com.google.impactdashboard.data.DataSummaryList;
import com.google.impactdashboard.data.project.Project;
import com.google.impactdashboard.server.DataSummaryRetriever;
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
@WebServlet("/list-summaries")
public class ListSummariesServlet extends HttpServlet {

  private DataSummaryRetriever dataSummaryRetriever;

  /**
   * Handles the creation of the server classes the first time the servlet is run.
   */
  @Override
  public void init() {
      dataSummaryRetriever = DataSummaryRetriever.create();
  }

  /**
   * Method called by frontend to retrieve the projects that can be accessed.
   * @param response contains json representation of the names of the projects.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DataSummaryList dataSummaryList = dataSummaryRetriever.getDataSummary();

    Gson gson = new Gson();
    String json = gson.toJson(dataSummaryList);
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }
}
