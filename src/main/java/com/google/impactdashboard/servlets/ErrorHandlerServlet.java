package com.google.impactdashboard.servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;

/**
 * Servlet that will be called when exception is thrown by any other servlet
 */
@WebServlet("/error-handler")
public class ErrorHandlerServlet extends HttpServlet {
}
