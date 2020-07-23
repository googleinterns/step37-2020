package com.google.impactdashboard.servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.impactdashboard.server.DataUpdater;

import java.io.IOException;

/**
 * Servlet for handling the scheduled daily update of the database
 * with new IAM data and Recommendation data.
 */
@WebServlet("/update-data")
public class UpdateDataServlet extends HttpServlet {

  private DataUpdater dataUpdater;

  @Override
  public void init() {
    try {
      dataUpdater = DataUpdater.create(DataUpdater.UpdateMode.AUTOMATIC_UPDATE);
    } catch (Exception e) {
      throw new RuntimeException("Could not create data updater: " + e.getMessage());
    }
  }

  /**
   * Method called from the appengine cron job to update the database with newest information
   * about IAM bindings and Recommendations.
   */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    dataUpdater.updateDatabase();
  }
}
