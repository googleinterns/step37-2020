[![FE Tests](https://github.com/googleinterns/step37-2020/workflows/Frontend%20Tests/badge.svg)](https://github.com/googleinterns/step37-2020/actions?query=workflow%3A%22Frontend+Tests%22)
[![BE Tests](https://github.com/googleinterns/step37-2020/workflows/Backend%20Tests/badge.svg)](https://github.com/googleinterns/step37-2020/actions?query=workflow%3A%22Backend+Tests%22)

# Recommendations Impact Dashboard

## Dev Setup
When first cloning this repo please run:
```
npm install
mvn install
```
Which will install all the required dependencies

## Database Setup
First, choose a project that will hold recommendations and bindings data collected by this web app, and ensure that the [Bigquery API is enabled](https://console.cloud.google.com/flows/enableapi?apiid=bigquery&_ga=2.243629059.74597765.1594049459-1491521344.1590087040&_gac=1.207882662.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) for this project.

You will also need a service account key to be able to access the data tables you'll be creating:
* Go to [this](https://console.cloud.google.com/apis/credentials/serviceaccountkey?_ga=2.219380767.74597765.1594049459-1491521344.1590087040&_gac=1.241888694.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) page.
* From the service account list, select **New service account**. 
* From the **Role** list, select **Project > Owner**. 
* Click **Create**. A JSON file containing your service account key will automatically download. Store this file locally in a secure place. 
* Navigate to `src/main/java/com/google/impactdashboard/configuration/Constants.java` in the project repo, and set `PATH_TO_SERVICE_ACCOUNT_KEY` to the path to your service account key. 

Next, you have to create data tables to store recommendations and bindings data:
* [Go to the Bigquery web UI](https://console.cloud.google.com/bigquery?_ga=2.253514767.74597765.1594049459-1491521344.1590087040&_gac=1.183307666.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) for your project. 

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

## Licensing
A special thanks to the authors of these libraries:
- angular-google-charts - [MIT](https://github.com/FERNman/angular-google-charts/blob/master/LICENSE.md)
- angular-fontawesome - [MIT](https://github.com/FortAwesome/angular-fontawesome/blob/master/LICENSE)
