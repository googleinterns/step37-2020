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

import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { request, fakeProjects, createIamGraphProperties } from '../../utils';
import { Project } from '../../model/project';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
/** The angular component that contains the graph and associated logic */
export class GraphComponent implements OnInit {
  /** The projects to display on the graph */
  @Input()
  public projects: Project[];

  public options: google.visualization.LineChartOptions;
  public graphData: any[];
  public columns: any[];
  public type = "LineChart";
  public title: string;
  /** Whether to show the chart. When it's not selected, prompt the user to select a project */
  public showChart: boolean;

  constructor() {
    this.showChart = false;
  }

  /** Called when an input field changes */
  ngOnChanges(changes: SimpleChanges) {
    // Perform GET for each project asynchronously
    let promises = [];
    this.projects.forEach(project => promises.push(request(`/get-project-data?id="${project.projectId}"`, 'GET').then(r => r.json())));

    Promise.all(promises).then(graphData => {
      if (graphData.length > 0) {
        // Generate the information needed for the graph
        let properties = createIamGraphProperties(graphData);
        this.columns = properties.columns;
        this.graphData = properties.rows;
        this.options = properties.options;

        this.title = `IAM Bindings - ${properties.startDate.toLocaleDateString()} to ${properties.endDate.toLocaleDateString()}`;
        this.showChart = true;
      } else {
        this.showChart = false;
      }
    });
  }


  async ngOnInit() {

  }
}
