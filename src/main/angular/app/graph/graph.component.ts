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

import {Component, OnInit, Input, SimpleChanges} from '@angular/core';
import {Project} from '../../model/project';
import {GraphProcessorService} from '../services/graph-processor.service';
import {GraphProperties} from '../../model/types';
import {DataService} from '../services/data.service';

/** The angular component that contains the graph and associated logic. */
@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
})
export class GraphComponent implements OnInit {
  /** The projects to display on the graph. */
  @Input()
  public projects: Project[];

  public properties: GraphProperties = this.graphProcessor.initProperties();

  /** Whether to show the chart. When it's not selected, prompt the user to select a project. */
  public shouldShowChart: boolean;

  constructor(
    private dataService: DataService,
    private graphProcessor: GraphProcessorService
  ) {
    this.shouldShowChart = false;
    this.projects = [];
  }

  /** Called when an input field changes. */
  ngOnChanges(changes: SimpleChanges) {
    this.shouldShowChart = this.projects.length > 0;
    this.graphProcessor.processChanges(
      changes,
      this.properties,
      this.dataService
    );
  }

  async ngOnInit() {}
}
