package com.google.impactdashboard.database_manager.bigquery;

import com.google.cloud.bigquery.BigQuery;
import com.google.cloud.bigquery.BigQueryOptions;
import com.google.cloud.bigquery.Job;
import com.google.cloud.bigquery.JobId;
import com.google.cloud.bigquery.JobInfo;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.TableResult;
import java.util.UUID;
import java.lang.RuntimeException;
import java.lang.InterruptedException;
import com.google.impactdashboard.configuration.Constants;
import com.google.auth.oauth2.GoogleCredentials;
import java.io.FileInputStream;
import java.io.IOException;

/** A class that queries the database. */
public class DatabaseAccessor {

  private BigQuery bigquery;

  /** 
   * Creates a {@code DatabaseAccesor} instance that contains an instance of 
   * {@code BigQuery} as well as the correct database to be queried based on the 
   * system configuration flags. 
   */
  public DatabaseAccessor() throws IOException {
    GoogleCredentials credentials = GoogleCredentials
      .fromStream(new FileInputStream(Constants.PATH_TO_SERVICE_ACCOUNT_KEY));
    bigquery = BigQueryOptions.newBuilder()
      .setCredentials(credentials).build().getService();
  }

  /** 
   * Queries the database with {@code query} and returns the table resulting from 
   * the query. 
   * @param query The SQl query to be applied to the database.
   * @return The table that is the result of querying {@code table} 
      with {@code query}.
   * @throws RuntimeException If there is a problem accessing the database. 
   */ 
  public TableResult readDatabase(QueryJobConfiguration query) {
    Job queryJob = runQuery(query);

    try {
      TableResult result = queryJob.getQueryResults();
      return result;
    } catch (InterruptedException interruptedException) {
      throw new RuntimeException("Query Interrupted! " + interruptedException.getMessage());
    }
  }

  /**
   * Updates the database with {@code query}, with side effects. 
   * @param query The SQL query to be applied to the database. This query should 
      not have any expected output.
   * @throws RuntimeException If there is a problem accessing the database.  
   */
  public void updateDatabase(QueryJobConfiguration query) {
    runQuery(query);
  }

  /**
   * Attempts to run {@code query}.
   * @param query The query to be run.
   * @return The complete job.
   * @throws RuntimeException If running the query fails. 
   */
  private Job runQuery(QueryJobConfiguration query) {
    JobId jobId = JobId.of(UUID.randomUUID().toString());
    Job queryJob = bigquery.create(JobInfo.newBuilder(query).setJobId(jobId).build());
    
    try {
      queryJob = queryJob.waitFor();
    } catch (InterruptedException interruptedException) {
      throw new RuntimeException("Query Interrupted! " + interruptedException.getMessage());
    }

    if (queryJob == null) {
      throw new RuntimeException("Job no longer exists!");
    } else if (queryJob.getStatus().getError() != null) {
      throw new RuntimeException("Query Error! " + queryJob.getStatus().getError().toString());
    }

    return queryJob;
  }
  
}
