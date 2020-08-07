[![FE Tests](https://github.com/googleinterns/step37-2020/workflows/Frontend%20Tests/badge.svg)](https://github.com/googleinterns/step37-2020/actions?query=workflow%3A%22Frontend+Tests%22)
[![BE Tests](https://github.com/googleinterns/step37-2020/workflows/Backend%20Tests/badge.svg)](https://github.com/googleinterns/step37-2020/actions?query=workflow%3A%22Backend+Tests%22)

# Recommendations Impact Dashboard
This web app allows users to easily visualize the long term impact of accepting Google Cloud Platform IAM Recommendations on their projects. 

For all projects of the user's choice, the dashboard plots the number of IAM bindings present on each day for that project, displaying up to 365 days of bindings data. Dates where recommendations were accepted are marked as circles on the graph along with detailed descriptions upon hover, so that users can easily see the impact that each recommendation had on project security. The dashboard can also graph an estimation of the number of bindings that would be present on each project if no recommendations had been accepted. Data can either be viewed individually by project or aggregated at the organization level. 

After cloning the repo and following the simple [deployment instructions](/Deployment_Instructions.md), the dashboard will be initialized with 30 days of recommendations and bindings data for all desired projects, and will continue collecting data daily to store up to a 365 day window of data. The list of projects to import data from can be easily modified at any time by following [these instructions](/New_Project_Instructions.md). 

![Dashboard](/images/Dashboard_With_Org_Tab.png)

## Licensing
A special thanks to the authors of these libraries:
- angular-google-charts - [MIT](https://github.com/FERNman/angular-google-charts/blob/master/LICENSE.md)
- angular-fontawesome - [MIT](https://github.com/FortAwesome/angular-fontawesome/blob/master/LICENSE)
