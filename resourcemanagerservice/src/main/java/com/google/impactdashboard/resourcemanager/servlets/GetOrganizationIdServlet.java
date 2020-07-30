package com.google.impactdashboard.resourcemanager.servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet for retrieving the Organization Id for the folder requested
 */
@WebServlet("/get-organization-id-servlet")
public class GetOrganizationIdServlet extends HttpServlet {

  /**
   * Method called by main service to get the organization id for a folder
   * @param request Contains the request for the folders organization id
   * @param response Contains the organization id for the forlder requested
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
  }
}
