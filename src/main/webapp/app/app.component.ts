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
import { request, setResponse, mapToArray } from '../utils';
import { ProjectData } from '../model/project-data';
import { Recommendation } from '../model/recommendation';
import { RecommenderType } from '../model/recommender-type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  async ngOnInit() {
    let iamBindings: { [key: number]: number } = {
      1: 50,
      2: 73,
      3: 82,
      4: 113,
      5: 60,
      6: 134,
      7: 75,
      8: 126,
      9: 93,
      10: 63,
      11: 145,
      12: 103,
      13: 130,
      14: 53,
      15: 83,
      16: 143,
      17: 148,
      18: 113,
      19: 97,
      20: 146,
    };
    let recommendations: { [key: number]: Recommendation } = {
      5: new Recommendation('project-1', 'Rec 1', RecommenderType.IAM_BINDING),
      11: new Recommendation('project-1', 'Rec 2', RecommenderType.IAM_BINDING),
      17: new Recommendation('project-1', 'Rec 2', RecommenderType.IAM_BINDING),
    }

    setResponse('/get-project-data?id="project-1"', new ProjectData('project-1', iamBindings, recommendations));
    this.data = await request('/get-project-data?id="project-1"', 'GET').then(r => r.json());
    this.graphData = mapToArray(this.data.dateToNumberIAMBindings);
    console.log(this.graphData);
  }

  title = 'Recommendations Impact Dashboard';
  type = 'LineChart';
  columns = ['Date', 'Bindings'];
  options = {

  };
  data;
  graphData;
  height = 400;
  width = 800;
}


