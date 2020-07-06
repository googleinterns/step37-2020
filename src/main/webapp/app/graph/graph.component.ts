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
import { getAdditionsDeletions, initProperties, addToGraph } from '../../utils';
import { Project } from '../../model/project';
import { ProjectGraphData } from '../../model/project-graph-data';

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

  public properties: { options: google.visualization.LineChartOptions, graphData: any[], columns: any[] } = initProperties();

  public type = "LineChart";
  public title: string;

  /** Whether to show the chart. When it's not selected, prompt the user to select a project */
  public showChart: boolean;

  constructor() {
    this.showChart = false;
  }

  /** Called when an input field changes */
  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    this.showChart = this.projects.length > 0;

    let additionsDeletions = getAdditionsDeletions(changes.projects);

    additionsDeletions.added.forEach(addition => ProjectGraphData.getProject(addition.projectId).then(data => { addToGraph(this.properties, data, addition); console.log(this.properties) }));

    // this.projects.forEach(project => promises.push(request(`/get-project-data?id="${project.projectId}"`, 'GET').then(r => r.json())));
  }


  async ngOnInit() {

  }
}
