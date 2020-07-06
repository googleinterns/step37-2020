package com.google.impactdashboard.servlets;

import com.google.gson.Gson;
import com.google.impactdashboard.server.utilities.ErrorMessage;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet that will be called when exception is thrown by any other servlet
 */
@WebServlet("/error-handler")
public class ErrorHandlerServlet extends HttpServlet {

  /**
   * Method used to send the information about exceptions to the front end.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Throwable exception = (Throwable) request.getAttribute("javax.servlet.error.exception");
    String message = (String) request.getAttribute("javax.servlet.error.message");

    ErrorMessage error = new ErrorMessage(message, exception);

    Gson gson = new Gson();
    String json  = gson.toJson(error);

    response.setContentType("application/json;");
    response.getWriter().println(json);
  }

}
