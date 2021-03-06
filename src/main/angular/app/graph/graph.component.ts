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

import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import {GraphProcessorService} from '../services/graph_processor.service';
import {GraphProperties, Columns} from '../../model/types';
import {
  WIDTH_SCALE_FACTOR,
  HEIGHT_SCALE_FACTOR,
  LOADING_MESSAGE,
  SELECT_PROJECT_MESSAGE,
} from '../../constants';
import {DateRange} from '../../model/date_range';
import {Resource} from '../../model/resource';

/** The angular component that contains the graph and associated logic. */
@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
})
export class GraphComponent implements OnInit {
  /** The resources to display on the graph. */
  @Input()
  public resources: Resource[];

  public properties: GraphProperties = this.graphProcessor.initProperties();

  /** Whether to show the chart. When it's not selected, prompt the user to select a project. */
  public shouldShowChart: boolean;
  /** The text that's shown when the chart isn't. */
  public noChartMessage: string;
  /** Whether to show the graph without accepted recommendations. */
  private showCumulativeDifference: boolean;

  constructor(private graphProcessor: GraphProcessorService) {
    this.shouldShowChart = false;
    this.resources = [];
    this.noChartMessage = LOADING_MESSAGE;
    this.showCumulativeDifference = false;
  }

  /** Called when an input field changes. */
  async ngOnChanges(changes: SimpleChanges) {
    if (changes.resources.isFirstChange()) {
      // We're still retrieving the list of projects
      this.shouldShowChart = false;
      this.noChartMessage = LOADING_MESSAGE;
    } else if (this.resources.length === 0) {
      // The user hasn't selected a project
      this.shouldShowChart = false;
      this.noChartMessage = SELECT_PROJECT_MESSAGE;
    } else if (
      this.resources.length === 1 &&
      changes.resources.previousValue.length === 0
    ) {
      // We're adding the first project on the graph
      this.shouldShowChart = false;
      this.noChartMessage = LOADING_MESSAGE;
    } else {
      // The data will be added to the live graph
      this.shouldShowChart = true;
    }

    await this.graphProcessor.processChanges(
      changes,
      this.properties,
      this.showCumulativeDifference
    );
    this.shouldShowChart = this.resources.length > 0;
  }

  toggleCumulativeDifference() {
    this.showCumulativeDifference = !this.showCumulativeDifference;
    if (this.showCumulativeDifference) {
      this.graphProcessor.addCumulativeDifferences(
        this.properties,
        this.resources
      );
    } else {
      this.graphProcessor.removeCumulativeDifferences(
        this.properties,
        this.resources
      );
    }
  }

  ngOnInit() {
    this.properties.width = window.innerWidth * WIDTH_SCALE_FACTOR;
    this.properties.height = window.innerHeight * HEIGHT_SCALE_FACTOR;
  }

  /** Change the range on the graph */
  changeDateRange(dateRange: DateRange) {
    this.properties.options.hAxis.viewWindow.min = dateRange.getStart();
    this.properties.options.hAxis.viewWindow.max = dateRange.getEnd();
    // Force a refresh of the chart
    const temp: Columns = [];
    this.properties.columns = temp.concat(this.properties.columns);
  }

  /** Listen for resizes of the window */
  @HostListener('window:resize')
  onResize() {
    this.properties.width = window.innerWidth * WIDTH_SCALE_FACTOR;
    this.properties.height = window.innerHeight * HEIGHT_SCALE_FACTOR;
  }
}
