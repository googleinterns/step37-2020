// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Component, OnInit } from '@angular/core';
import { request, fakeProjects, createIamGraphProperties } from '../../utils';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
/** The angular component that contains the graph and associated logic */
export class GraphComponent implements OnInit {
  public options: google.visualization.LineChartOptions;
  public graphData;
  public columns: any[];
  public type = "LineChart";

  constructor() {
  }

  async ngOnInit() {
    fakeProjects();
    let projects = await request('/list-project-summaries', 'GET').then(r => r.json());


    // Perform GET for each project asynchronously
    let promises = [];
    projects.forEach(project => promises.push(request(`/get-project-data?id="${project.projectId}"`, 'GET').then(r => r.json())));

    Promise.all(promises).then(graphData => {
      // Generate the information needed for the graph
      let properties = createIamGraphProperties(graphData);
      console.log(properties);
      this.columns = properties.columns;
      this.graphData = properties.rows;
      this.options = properties.options;
    });
  }
}
