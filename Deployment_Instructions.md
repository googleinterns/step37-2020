## Dev Setup
When first cloning this repo please run:
```
npm install
mvn install
```
Which will install all the required dependencies

## API Setup
First, choose a project on which to deploy the Recommendations Impact Dashboard. Before deploying, you must ensure that the following APIs are enabled on your deploying project:
* [Bigquery](https://console.cloud.google.com/flows/enableapi?apiid=bigquery&_ga=2.243629059.74597765.1594049459-1491521344.1590087040&_gac=1.207882662.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE)
* [Cloud Resource Manager](https://pantheon.corp.google.com/apis/library/cloudresourcemanager.googleapis.com?q=resource&id=16f5d23e-c895-4b9d-88e4-864c1766636f)
* [Cloud Logging](https://pantheon.corp.google.com/apis/library/logging.googleapis.com?q=cloud%20logging&id=2f300cb8-473f-427e-b0ef-366cfa21dccc)
* [Recommender](https://pantheon.corp.google.com/apis/library/recommender.googleapis.com?q=Recommender&id=3f925ce1-aaf9-4a28-b527-3a52a8ee0cc1)
* [IAM](https://pantheon.corp.google.com/apis/library/iam.googleapis.com?q=IAM&id=7af3ed42-ced4-4dcb-a8e0-6c823c9c40b9)

## Service Account Setup
First, navigate to the [IAM page](https://console.cloud.google.com/iam-admin/iam?_ga=2.165735869.248724417.1594646215-1491521344.1590087040&_gac=1.48940818.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) and ensure that your **deploying project** is selected at the top left. Identify the service account with the name **App Engine default service account**, and add the role **Bigquery Admin** to the service account. 

### Project Level Permissions
Next, In order to allow the Impact Dashboard to access the projects for which you want to view data, for each project of interest (with the exception of the deploying project): 
* Navigate to the [IAM page](https://console.cloud.google.com/iam-admin/iam?_ga=2.165735869.248724417.1594646215-1491521344.1590087040&_gac=1.48940818.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) of that project.
* Click **Add** at the top of the page
* In the **New members** box, paste the member name of the App Engine default service account of your **deploying project** (it should look something like deploying-project-id@appspot.gserviceaccount.com).
* Select the role **Project > Viewer**

### Organization Level Permissions
If you would like to view data for every project belonging to an organization, you do not have to individually grant viewer permissions on every project; instead you can simply grant the Viewer role at the organization level, and the dashboard will automatically collect data on every project belonging to that organization:
* Navigate to the [IAM page](https://console.cloud.google.com/iam-admin/iam?_ga=2.165735869.248724417.1594646215-1491521344.1590087040&_gac=1.48940818.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) of that organization.
* Click **Add** at the top of the page
* In the **New members** box, paste the member name of the App Engine default service account of your **deploying project** (it should look something like deploying-project-id@appspot.gserviceaccount.com).
* Select the role **Resource Manager > Organization Viewer**

**NOTE**: If you do not want to view every project in an organization, you still need to grant some permissions at the organization-level for every parent organization of a project of interest, in order to enable including organization-level custom roles in the daily IAM Bindings calculations as well as displaying the name of the organization. The necessary permissions are as follows:
```
iam.roles.get
iam.roles.list
resourcemanager.organizations.get
```

## Database Setup
On your deploying project, you must create data tables to store recommendations and bindings data:
* Go to the [Bigquery web UI](https://console.cloud.google.com/bigquery?_ga=2.253514767.74597765.1594049459-1491521344.1590087040&_gac=1.183307666.1592573304.EAIaIQobChMIyefY7P2N6gIVhgiICR3E6Ab4EAAYASAAEgJZ0fD_BwE) for your **deploying project**. 

* Click **Create dataset**.
  * For **Dataset ID**, enter a name of your choice for the database.
  * Navigate to `/src/main/java/com/google/impactdashboard/configuration/Constants.java` in the repo and set the constant `DATABASE` to the name of your database. 
  * For **Data location**, choose **United States (US)**.
  * Leave all other settings in place and click **Create dataset**.

* Click **Create table**.
  * Under **Destination**, make sure **Project name** is the name of your project, and **Dataset name** is set to the name you chose.
  * Set **Table name** to `IAM_Bindings`.
  * Select **Edit as text** under **Schema**
  * Navigate to `table_schemas` in the project repo and copy and paste the contents of `IAM_Bindings_Schema.json` into the **Edit as text** text box. 
  * Leave all other default settings and select **Create table**.
  
* Click **Create table**
  * Under **Destination**, make sure **Project name** is the name of your project, and **Dataset name** is set to the name you chose.
  * Set **Table name** to `Recommendations`.
  * Select **Edit as text** under **Schema**
  * Navigate to `table_schemas` in the project repo and copy and paste the contents of `Recommendations_Schema.json` into the **Edit as text** text box. 
  * Leave all other default settings and select **Create table**.
  
## Code Configuration

Navigate to `src/main/java/com/google/impactdashboard/configuration/Constants.java` in the repo, and set the value of `PROJECT_ID` equal to the project id of your deploying project. 

Navigate to `/pom.xml` in the repo, and look for this block of code:
```
<configuration>
  <deploy.projectId> ... </deploy.projectId>
  <deploy.version>1</deploy.version>
  ...
</configuration>
```
Enter the id of your deploying project between `<deploy.projectId>` and `</deploy.projectId>`. 

## Deploying the application to AppEngine
To deploy to AppEngine, follow [these](https://cloud.google.com/cloud-build/docs/deploying-builds/deploy-appengine) step and then run:
```
npm run deploy
```
The project data will be automatically imported at midnight once the project is deployed. To import the data immediately instead, on the deployed project page navigate to the **/admin** url and click the **Manual Update** button. This import could take several minutes, so please wait until the loading bar finishes before navigating back to the main page. 
