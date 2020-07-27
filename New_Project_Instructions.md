# Adding New Projects to the Dashboard

Adding projects to the Recommendations Impact Dashboard does not require re-deploying the site. Instead, for each project you wish to add:
* Navigate to the [IAM page](https://console.cloud.google.com/iam-admin/iam?_ga=2.165735869.248724417.1594646215-1491521344.1590087040&_gac=1.48940818.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) of that project.
* Click **Add** at the top of the page
* In the **New members** box, paste the member name of the App Engine default service account of your **deploying project** (it should look something like deploying-project-id@appspot.gserviceaccount.com).
* Select the role **Project > Viewer**

Once the service account has been added to the project, the data for that project will automatically be imported daily at midnight. If you do not want to wait until midnight to see the project data, navigate to the **/admin** url on the dashboard and click the **Manual Update** button. This import could take several minutes, so please wait until the loading bar finishes before navigating back to the main page. 

Note that the manual update will retrieve 30 days of data for any and all new projects, so if you have added multiple projects to the dashboard, you only need to initiate the manual update once. 

# Removing Projects from the Dashboard

To make the dashboard stop collecting data for a project, simply remove the App Engine default service account from the deploying project:
* Navigate to the [IAM page](https://console.cloud.google.com/iam-admin/iam?_ga=2.165735869.248724417.1594646215-1491521344.1590087040&_gac=1.48940818.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) of that project.
* Check the box by the App Engine default service account of your deploying project.
* Add the top of the page, clock **Remove**.

If you also want to have the project no longer show up on the Dashboard web page:
* Go to the [Bigquery web UI](https://console.cloud.google.com/bigquery?_ga=2.253514767.74597765.1594049459-1491521344.1590087040&_gac=1.183307666.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) for your **deploying project**. 
* Run the following queries, replacing `[DEPLOYING_PROJECT_ID]` with the project id of your deploying project, and replace `[REMOVE_PROJECT_ID]` with the project id of the project you wish to delete:
```
DELETE FROM `[DEPLOYING_PROJECT_ID].Recommendations_Impact_Dashboard.IAM_Bindings` 
  WHERE ProjectId = '[REMOVE_PROJECT_ID]'
  
DELETE FROM `[DEPLOYING_PROJECT_ID].Recommendations_Impact_Dashboard.Recommendations` 
  WHERE ProjectId = '[REMOVE_PROJECT_ID]'
```
