// Copyright 2020 Google LLC
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

import {ProjectGraphData} from './model/project-graph-data';
import {Recommendation} from './model/recommendation';
import {ProjectMetaData} from './model/project-metadata';
import {Project} from './model/project';
import {RecommenderType} from './model/recommender-type';
import {SimpleChange} from '@angular/core';

/** Whether this is a test or not. */
export const DEFAULT_IS_TEST = false;
// See https://standards.google/guidelines/brand-standards/color/palette/#brand-colors
export const DEFAULT_COLORS: string[] = [
  // Google blue
  '#174ea6',
  // Google red
  '#a50e0e',
  // Google yellow
  '#e37400',
  // Google green
  '#0d652d',
];

/** From a given SimpleChange, extract the projects that were added or deleted */
export function getAdditionsDeletions(
  change: SimpleChange
): {added: Project[]; removed: Project[]} {
  const out: {added: Project[]; removed: Project[]} = {added: [], removed: []};
  if (change.previousValue === undefined) {
    out.added = change.currentValue;
    return out;
  }

  // Look for additions
  change.currentValue
    .filter((c: Project) => !change.previousValue.includes(c))
    .forEach((addition: Project) => out.added.push(addition));
  // Look for removals
  change.previousValue
    .filter((c: Project) => !change.currentValue.includes(c))
    .forEach((deletion: Project) => out.removed.push(deletion));
  return out;
}

/** Checks if the two timestamps (millis since epoch) fall on the same day. Returns true if they do */
export function fallOnSameDay(time1: number, time2: number): boolean {
  const date1 = new Date(0);
  date1.setTime(time1);
  const date2 = new Date(0);
  date2.setTime(time2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/** Returns the recommendations which occured on the same day as the given time, which is in milliseconds since epoch */
function getRecommendationsOnSameDay(
  time: number,
  dateToRecommendation: {[timeInMillis: number]: Recommendation}
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  for (const [key, value] of Object.entries(dateToRecommendation)) {
    if (fallOnSameDay(time, +key)) {
      recommendations.push(value);
    }
  }
  return recommendations;
}

/** Returns the tooltip associated with the given IAM Bindings time */
function getTooltip(
  numberBindings: number,
  matchingRecommendations: Recommendation[]
): string {
  // The list of recommendations on the same day
  if (matchingRecommendations.length === 0) {
    return `IAM Bindings: ${numberBindings}`;
  }

  let tooltip = '';
  matchingRecommendations.forEach((recommendation, index) => {
    tooltip += recommendation.description;
    if (index < matchingRecommendations.length - 1) {
      tooltip += '\n';
    }
  });
  return tooltip;
}

/** Returns the point styling associated with the given recommendation */
function getPoint(
  matchingRecommendations: Recommendation[],
  color: string
): string | undefined {
  if (matchingRecommendations.length === 0) {
    return undefined;
  }
  return `point { size: 10; shape-type: circle; fill-color: ${color}; visible: true; }`;
}

/** Converts the given millis since epoch to the start of the day in the local timezone */
function startOfDay(time: number): Date {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Extract all the unique days from the given mappings and returns them sorted */
function uniqueDays(graphData: ProjectGraphData[]): Date[] {
  const days: Set<number> = new Set();
  graphData.forEach(data => {
    Object.keys(data.dateToNumberIAMBindings)
      .map(time => startOfDay(+time))
      .forEach(date => days.add(date.getTime()));
  });

  const out: Date[] = [];
  days.forEach(time => {
    out.push(new Date(time));
  });

  out.sort((a, b) => a.getTime() - b.getTime());
  return out;
}

/** Checks if the rows already includes the given day */
function includesDay(rows: any[], day: Date): boolean {
  return rows.findIndex(row => row[0].getTime() === day.getTime()) !== -1;
}

/** Returns the row representing the given day */
function getRow(rows: any[], day: Date): any[] {
  return rows.find(row => row[0].getTime() === day.getTime());
}

/** Adds the table rows for the given Project. Each row is [time, data1, data1-tooltip, data1-style, data2, data2-tooltip, ...] */
export function addIamRows(
  rows: any[],
  data: ProjectGraphData,
  project: Project,
  seriesNum: number
): any[] {
  // First, get all the days we need to add if it hasn't already been provided
  const days = uniqueDays([data]);

  // Add a row for each new unique day
  days
    .filter(day => !includesDay(rows, day))
    .forEach(day => {
      const row: any[] = [day];
      // Fill in columns for all existing projects with empty data
      for (let i = 0; i < seriesNum * 3; i++) {
        row.push(undefined);
      }
      rows.push(row);
    });

  // Sort rows in increasing order
  rows.sort((a, b) => a[0].getTime() - b[0].getTime());

  for (const [key, value] of Object.entries(data.dateToNumberIAMBindings)) {
    // Convert key from string to number
    const date = startOfDay(+key);
    // The row we're adding to is the same index as unique days
    const row = getRow(rows, date);

    const recommendations = getRecommendationsOnSameDay(
      +key,
      data.dateToRecommendationTaken
    );
    const tooltip = getTooltip(value, recommendations);
    const point = getPoint(recommendations, project.color);

    // Populate the existing row with information
    row.push(value, tooltip, point);
  }

  // Now add empty data for rows that weren't touched
  rows.forEach(row => {
    if (row.length < (seriesNum + 1) * 3 + 1) {
      row.push(undefined, undefined, undefined);
    }
  });

  return rows;
}

/** Adds the column headers for a single project on an IAM graph. Takes the form of [time, data1, data1-tooltip, data1-style, data2, data2-tooltip, ...] */
export function addIamColumns(columns: any[], data: ProjectGraphData): void {
  // Populate the header row, which contains the column purposes
  columns.push(
    data.projectId,
    {type: 'string', role: 'tooltip'},
    {type: 'string', role: 'style'}
  );
}

/** Create basic options for a LineChart */
export function createOptions(): google.visualization.LineChartOptions {
  const options: google.visualization.LineChartOptions = {
    animation: {
      duration: 500,
      easing: 'out',
      startup: true,
    },
    legend: {position: 'none'},
    height: 700,
    width: 1000,
    hAxis: {
      gridlines: {
        color: 'white',
      },
    },
    vAxis: {
      minorGridlines: {
        color: 'white',
      },
    },
    series: {},
  };
  return options;
}

/** Initialize the chart properties with empty data */
export function initProperties(): {
  options: google.visualization.LineChartOptions;
  graphData: any[];
  columns: any[];
} {
  const out: any = {};
  out.options = createOptions();
  out.graphData = [];
  out.columns = ['Time'];
  return out;
}

/** Adds the given project to the graph */
export function addToGraph(
  properties: {
    options: google.visualization.LineChartOptions;
    graphData: any[];
    columns: any[];
  },
  data: ProjectGraphData,
  project: Project
) {
  const seriesNum: number = (properties.columns.length - 1) / 3;
  // Set the color and add the new columns
  if (properties.options.series) {
    properties.options.series[seriesNum] = {color: project.color};
  }
  addIamColumns(properties.columns, data);
  // Add the new rows
  addIamRows(properties.graphData, data, project, seriesNum);

  // Force a refresh of the chart
  const temp: any[] = [];
  properties.columns = temp.concat(properties.columns);
}

/** Removes the given project from the graph */
export function removeFromGraph(
  properties: {
    options: google.visualization.LineChartOptions;
    graphData: any[];
    columns: any[];
  },
  project: Project
) {
  const seriesNum: number =
    (properties.columns.indexOf(project.projectId) - 1) / 3;

  if (properties.options.series) {
    for (const [key, value] of Object.entries(properties.options.series)) {
      if (+key >= seriesNum && properties.options.series) {
        properties.options.series[+key] = properties.options.series[+key + 1];
        delete properties.options.series[+key + 1];
      }
    }
  }

  properties.columns.splice(seriesNum * 3 + 1, 3);
  properties.graphData.forEach(row => row.splice(seriesNum * 3 + 1, 3));

  // Force a refresh of the chart
  const temp: any[] = [];
  properties.columns = temp.concat(properties.columns);
}
