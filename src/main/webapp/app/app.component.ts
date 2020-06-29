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
import { request, setResponse, iamBindingsToGraphData } from '../utils';
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
      5: new Recommendation('project-1', 'Rec 1', RecommenderType.IAM_BINDING),
      11: new Recommendation('project-1', 'Rec 2', RecommenderType.IAM_BINDING),
      17: new Recommendation('project-1', 'Rec 2', RecommenderType.IAM_BINDING),
    }

    setResponse('/get-project-data?id="project-1"', new ProjectData('project-1', iamBindings, recommendations));
    this.data = await request('/get-project-data?id="project-1"', 'GET').then(r => r.json());
    this.graphData = iamBindingsToGraphData(this.data.dateToNumberIAMBindings);
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


