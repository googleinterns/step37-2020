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
import { request, setResponse, createIamRows } from '../../utils';
import { ProjectGraphData } from '../../model/project-graph-data';
import { Recommendation } from '../../model/recommendation';
import { RecommenderType } from '../../model/recommender-type';

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
  public columns: any[] = ['Time'];
  public type = "LineChart";

  constructor() {
  }

  fakeProject1(): string {
    let projectId = 'project-1';
    // Fake data for showing the graph
    let iamBindings: { [key: number]: number } = {
      [Date.parse('1 Jun 2020 UTC')]: 131,
      [Date.parse('2 Jun 2020 UTC')]: 56,
      [Date.parse('3 Jun 2020 UTC')]: 84,
      [Date.parse('4 Jun 2020 UTC')]: 101,
      [Date.parse('5 Jun 2020 UTC')]: 100,
      [Date.parse('6 Jun 2020 UTC')]: 90,
      [Date.parse('7 Jun 2020 UTC')]: 66,
      [Date.parse('8 Jun 2020 UTC')]: 136,
      [Date.parse('9 Jun 2020 UTC')]: 108,
      [Date.parse('10 Jun 2020 UTC')]: 50,
      [Date.parse('11 Jun 2020 UTC')]: 92,
      [Date.parse('12 Jun 2020 UTC')]: 136,
      [Date.parse('13 Jun 2020 UTC')]: 55,
      [Date.parse('14 Jun 2020 UTC')]: 148,
      [Date.parse('15 Jun 2020 UTC')]: 141,
      [Date.parse('16 Jun 2020 UTC')]: 64,
      [Date.parse('17 Jun 2020 UTC')]: 102,
      [Date.parse('18 Jun 2020 UTC')]: 139,
      [Date.parse('19 Jun 2020 UTC')]: 87,
      [Date.parse('20 Jun 2020 UTC')]: 57,
    };
    let recommendations: { [key: number]: Recommendation } = {
      [Date.parse('5 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 1', RecommenderType.IAM_BINDING),
      [Date.parse('9 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 2', RecommenderType.IAM_BINDING),
      [Date.parse('17 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 3', RecommenderType.IAM_BINDING),
      // Simulate two recommendations on one day
      [Date.parse('17 Jun 2020 UTC') + 1]: new Recommendation(projectId, 'Rec 4', RecommenderType.IAM_BINDING),
    }

    let url = `/get-project-data?id="${projectId}"`;
    // Fake out the given url to the generated fake project
    setResponse(url, new ProjectGraphData(projectId, iamBindings, recommendations));
    return projectId;
  }

  fakeProject2(): string {
    let projectId = 'project-2';
    // Fake data for showing the graph
    let iamBindings: { [key: number]: number } = {
      [Date.parse('1 Jun 2020 UTC')]: 28,
      [Date.parse('2 Jun 2020 UTC')]: 36,
      [Date.parse('3 Jun 2020 UTC')]: 22,
      [Date.parse('4 Jun 2020 UTC')]: 62,
      [Date.parse('5 Jun 2020 UTC')]: 60,
      [Date.parse('6 Jun 2020 UTC')]: 41,
      [Date.parse('7 Jun 2020 UTC')]: 52,
      [Date.parse('8 Jun 2020 UTC')]: 27,
      [Date.parse('9 Jun 2020 UTC')]: 55,
      [Date.parse('10 Jun 2020 UTC')]: 38,
      [Date.parse('11 Jun 2020 UTC')]: 28,
      [Date.parse('12 Jun 2020 UTC')]: 38,
      [Date.parse('13 Jun 2020 UTC')]: 34,
      [Date.parse('14 Jun 2020 UTC')]: 18,
      [Date.parse('15 Jun 2020 UTC')]: 12,
      [Date.parse('16 Jun 2020 UTC')]: 48,
      [Date.parse('17 Jun 2020 UTC')]: 47,
      [Date.parse('18 Jun 2020 UTC')]: 60,
      [Date.parse('19 Jun 2020 UTC')]: 20,
      [Date.parse('20 Jun 2020 UTC')]: 61,
    };
    let recommendations: { [key: number]: Recommendation } = {
      [Date.parse('1 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 1', RecommenderType.IAM_BINDING),
      [Date.parse('9 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 2', RecommenderType.IAM_BINDING),
      [Date.parse('20 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 3', RecommenderType.IAM_BINDING),
      // Simulate two recommendations on one day
      [Date.parse('20 Jun 2020 UTC') + 1]: new Recommendation(projectId, 'Rec 4', RecommenderType.IAM_BINDING),
    }

    let url = `/get-project-data?id="${projectId}"`;
    // Fake out the given url to the generated fake project
    setResponse(url, new ProjectGraphData(projectId, iamBindings, recommendations));
    return projectId;
  }

  async ngOnInit() {
    let projectIds = [];
    projectIds.push(this.fakeProject1());
    projectIds.push(this.fakeProject2());

    let data = [];
    for(let i = 0; i < projectIds.length; i++) {
      this.columns.push(projectIds[i]);
      this.columns.push({ type: 'string', role: 'tooltip' });
      this.columns.push({ type: 'string', role: 'style' });
      data.push(await request(`/get-project-data?id="${projectIds[i]}"`, 'GET').then(r => r.json()));
    }

    this.graphData = createIamRows(data);
  }
}
