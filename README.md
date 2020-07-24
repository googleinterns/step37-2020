[![FE Tests](https://github.com/googleinterns/step37-2020/workflows/Frontend%20Tests/badge.svg)](https://github.com/googleinterns/step37-2020/actions?query=workflow%3A%22Frontend+Tests%22)
[![BE Tests](https://github.com/googleinterns/step37-2020/workflows/Backend%20Tests/badge.svg)](https://github.com/googleinterns/step37-2020/actions?query=workflow%3A%22Backend+Tests%22)

# Recommendations Impact Dashboard
This web app allows users to easily visualize the long term impact of accepting Google Cloud Platform IAM Recommendations on their projects. 

For all projects of the user's choice, the dashboard plots the number of IAM bindings present on each day for that project, displaying up to 365 days of bindings data. Dates where recommendations were accepted are marked on the graph along with detailed descriptions, so that users can easily see the impact that each recommendation had on project security. The dashboard can also graph an estimation of the numberof bindings that would be present on each project if no recommendations had been accepted.

After cloning the repo and following simple configuration steps to personalize the dashboard, the dashboard will be initialized with 30 days of recommendations and bindings data for all desired projects, and will continue collecting data daily to store up to a 365 day window of data. The list of projects to import data from can be easily modified at any time. 

## Dev Setup
When first cloning this repo please run:
```
npm install
mvn install
```
Which will install all the required dependencies

## API Setup
First, choose a project to deploy the Recommendations Impact Dashboard. Before deploying, you must ensure that the following APIs are enabled on your deploying project:
* [Bigquery](https://console.cloud.google.com/flows/enableapi?apiid=bigquery&_ga=2.243629059.74597765.1594049459-1491521344.1590087040&_gac=1.207882662.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE)
* [Cloud Resource Manager](https://pantheon.corp.google.com/apis/library/cloudresourcemanager.googleapis.com?q=resource&id=16f5d23e-c895-4b9d-88e4-864c1766636f)

## Service Account Setup
First, navigate to the [IAM page](https://console.cloud.google.com/iam-admin/iam?_ga=2.165735869.248724417.1594646215-1491521344.1590087040&_gac=1.48940818.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) and ensure that your **deploying project** is selected at the top left. Identify the service account with the name **App Engine default service account**, and add the role **Bigquery Admin** to the service account. 

Next, In order to allow the Impact Dashboard to access the projects for which you want to view data, for each project of interest (with the exception of the deploying project): 
* Navigate to the [IAM page](https://console.cloud.google.com/iam-admin/iam?_ga=2.165735869.248724417.1594646215-1491521344.1590087040&_gac=1.48940818.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) of that project.
* Click **Add** at the top of the page
* In the **New members** box, paste the member name of the App Engine default service account of your **deploying project** (it should look something like deploying-project-id@appspot.gserviceaccount.com).
* Select the role **Project > Viewer**

**(Optional)** If you would like to be able to test the Dashboard on a local server before deploying, you must create a service account to use locally: 
* Go to the [service account page](https://console.cloud.google.com/apis/credentials/serviceaccountkey?_ga=2.219380767.74597765.1594049459-1491521344.1590087040&_gac=1.241888694.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE).
* From the service account list, select **New service account**. 
* From the **Role** list, select **Project > Owner**. 
* Click **Create**. A JSON file containing your service account key will automatically download. Store this file locally in a secure place. 
* Navigate to `src/main/java/com/google/impactdashboard/configuration/Constants.java` in the project repo, and set `PATH_TO_SERVICE_ACCOUNT_KEY` to the path to where you have stored the key locally.
* Repeat the steps above to add this service account to all of your projects of interest. 

## Database Setup
On your deploying project, you must create data tables to store recommendations and bindings data:
* [Go to the Bigquery web UI](https://console.cloud.google.com/bigquery?_ga=2.253514767.74597765.1594049459-1491521344.1590087040&_gac=1.183307666.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) for your **deploying project**. 

* Click **Create dataset**.
  * For **Dataset ID**, enter `Recommendations_Impact_Dashboard`.
  * For **Data location**, choose **United States (US)**.
  * Leave all other settings in place and click **Create dataset**.

* Click **Create table**.
  * Under **Destination**, make sure **Project name** is the name of your project, and **Dataset name** is set to `Recommendations_Impact_Dashboard`.
  * Set **Table name** to `IAM_Bindings`.
  * Select **Edit as text** under **Schema**
  * Navigate to `table_schemas` in the project repo and copy and paste the contents of `IAM_Bindings_Schema.json` into the **Edit as text** text box. 
  * Leave all other default settings and select **Create table**.
  
* Click **Create table**
  * Under **Destination**, make sure **Project name** is the name of your project, and **Dataset name** is set to `Recommendations_Impact_Dashboard`.
  * Set **Table name** to `Recommendations`.
  * Select **Edit as text** under **Schema**
  * Navigate to `table_schemas` in the project repo and copy and paste the contents of `Recommendations_Schema.json` into the **Edit as text** text box. 
  * Leave all other default settings and select **Create table**.

## Running the application in devmode
To run the full application, please run
```
npm run build
```
Which will compile angular and bundle it with the appropriate Java files.

## Deploying the application to AppEngine
To deploy to AppEngine, please run
```
npm run deploy
```

## Licensing
A special thanks to the authors of these libraries:
- angular-google-charts - [MIT](https://github.com/FERNman/angular-google-charts/blob/master/LICENSE.md)
- angular-fontawesome - [MIT](https://github.com/FortAwesome/angular-fontawesome/blob/master/LICENSE)
