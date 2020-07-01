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
import { request, setResponse, createIamRows, fakeProjects } from '../../utils';
import { ProjectGraphData } from '../../model/project-graph-data';
import { Recommendation } from '../../model/recommendation';
import { RecommenderType } from '../../model/recommender-type';
import { Project } from '../../model/project';
import { ProjectMetaData } from '../../model/project-metadata';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
/** The angular component that contains the graph and associated logic */
export class GraphComponent implements OnInit {
  public options: google.visualization.LineChartOptions = {
    animation: {
      duration: 250,
      easing: 'ease-in-out',
      startup: true
    },
    legend: { position: 'none' },
    height: 700,
    width: 1000,
    hAxis: {
      gridlines: {
        color: 'white'
      }
    },
    vAxis: {
      minorGridlines: {
        color: 'white'
      }
    }
  }
  public graphData;
  public columns: any[];
  public type = "LineChart";

  constructor() {
  }

  

  async ngOnInit() {
    fakeProjects();
    let projects = await request('/list-project-summaries', 'GET').then(r => r.json());

    let data = [];
    for(let i = 0; i < projects.length; i++) {
      data.push(await request(`/get-project-data?id="${projects[i].projectId}"`, 'GET').then(r => r.json()));
    }

    // Generate the rows and set the columns to be the first row returned
    let rows = createIamRows(data);
    this.columns = rows[0];
    rows.splice(0, 1);
    this.graphData = rows;
  }
}
