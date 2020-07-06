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

import { ProjectGraphData } from './model/project-graph-data';
import { Recommendation } from './model/recommendation';
import { ProjectMetaData } from './model/project-metadata';
import { Project } from './model/project';
import { RecommenderType } from './model/recommender-type';
import { SimpleChange } from '@angular/core';

/** Whether this is a test or not. */
export var defaultIsTest: boolean = true;
export var defaultColors: string[] = ['#3c78d8', '#cc0000', '#ff9900', '#b6d7a8', '#9c27b0'];

/** Used internally to dish out fake responses when requested. Effectively a map from URL to response */
var fakeResponses: { [key: string]: any } = {};

/** Sends the given request to HTTP if isTest is false, otherwise fakes out the request */
export async function request(url: string, method: string, body = undefined, isTest: boolean = defaultIsTest): Promise<{ json: any }> {
  if (isTest) {
    return new Promise(resolve => {
      let response = getFake(url, method);
      // When the user calls json() on the promise, 
      resolve({ json: () => response });
    });
  } else {
    return fetch(url, {
      method: method,
      body: JSON.stringify(body)
    });
  }
}

/** Checks if the two timestamps (millis since epoch) fall on the same day. Returns true if they do */
export function fallOnSameDay(time1: number, time2: number): boolean {
  let date1 = new Date(0);
  date1.setTime(time1);
  let date2 = new Date(0);
  date2.setTime(time2);

  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

/** Returns the recommendations which occured on the same day as the given time, which is in milliseconds since epoch */
function getRecommendations(time: number, dateToRecommendation: { [key: number]: Recommendation }): Recommendation[] {
  let recommendations: Recommendation[] = [];
  for (let [key, value] of Object.entries(dateToRecommendation)) {
    if (fallOnSameDay(time, +key)) {
      recommendations.push(value);
    }
  }
  return recommendations;
}

/** Returns the tooltip associated with the given IAM Bindings time */
function getTooltip(numberBindings: number, matchingRecommendations: Recommendation[]): string {
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
function getPoint(matchingRecommendations: Recommendation[], color: string): string {
  if (matchingRecommendations.length === 0) {
    return null;
  }
  return `point { size: 10; shape-type: circle; fill-color: ${color}; visible: true; }`;
}

/** Converts the given millis since epoch to the start of the day in the local timezone */
function startOfDay(time: number): Date {
  let date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Extract all the unique days from the given mappings and returns them sorted */
function uniqueDays(graphData: ProjectGraphData[]): Date[] {
  let days: Set<number> = new Set();
  graphData.forEach(data => {
    Object.keys(data.dateToNumberIAMBindings).map(time => startOfDay(+time)).forEach(date => days.add(date.getTime()));
  });

  let out: Date[] = [];
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
export function addIamRows(rows: any[], data: ProjectGraphData, project: Project, seriesNum: number): any[] {
  // First, get all the days we need to add if it hasn't already been provided
  let days = uniqueDays([data]);

  // Add a row for each new unique day
  days.filter(day => !includesDay(rows, day)).forEach(day => {
    let row = [day];
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
    let date = startOfDay(+key);
    // The row we're adding to is the same index as unique days
    let row = getRow(rows, date);

    let recommendations = getRecommendations(+key, data.dateToRecommendationTaken);
    let tooltip = getTooltip(value, recommendations);
    let point = getPoint(recommendations, project.color);

    // Populate the existing row with information
    row.push(value, tooltip, point);
  }

  // Now add empty data for rows that weren't touched
  rows.forEach(row => {
    if(row.length < (seriesNum + 1) * 3 + 1) {
      row.push(undefined, undefined, undefined);
    }
  });

  return rows;
}

/** Adds the column headers for a single project on an IAM graph */
export function addIamColumns(columns: any[], data: ProjectGraphData): void {
  // Populate the header row, which contains the column purposes
  columns.push(data.projectId, { type: 'string', role: 'tooltip' }, { type: 'string', role: 'style' });
}

/** Create options for a LineChart */
export function createOptions(): google.visualization.LineChartOptions {
  let options: google.visualization.LineChartOptions = {
    animation: {
      duration: 250,
      easing: 'out',
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
    },
    series: {}
  }
  return options;
}

/** From a given SimpleChange, extract the projects that were added or deleted */
export function getAdditionsDeletions(change: SimpleChange): { added: Project[], removed: Project[] } {
  let out = { added: [], removed: [] };
  if (change.previousValue === undefined) {
    out.added = change.currentValue;
    return out;
  }

  // Look for additions
  change.currentValue.filter(c => !change.previousValue.includes(c)).forEach(addition => out.added.push(addition));
  // Look for removals
  change.previousValue.filter(c => !change.currentValue.includes(c)).forEach(deletion => out.removed.push(deletion));
  return out;
}

/** Initialize the chart properties with empty data */
export function initProperties(): { options: google.visualization.LineChartOptions, graphData: any[], columns: any[] } {
  let out: any = {};
  out.options = createOptions();
  out.graphData = [];
  out.columns = ['Time']
  return out;
}

/** Adds the given project to the graph */
export function addToGraph(properties: { options: google.visualization.LineChartOptions, graphData: any[], columns: any[] }, data: ProjectGraphData, project: Project) {
  let seriesNum: number = (properties.columns.length - 1) / 3;
  // Set the color and add the new columns
  properties.options.series[seriesNum] = { color: project.color };
  addIamColumns(properties.columns, data);
  // Add the new rows
  addIamRows(properties.graphData, data, project, seriesNum);

  // Force a refresh of the chart
  properties.columns = [].concat(properties.columns);
}

/** Removes the given project from the graph */
export function removeFromGraph(properties: { options: google.visualization.LineChartOptions, graphData: any[], columns: any[] }, project: Project) {
  let seriesNum: number = (properties.columns.indexOf(project.projectId) - 1) / 3;

  for (let [key, value] of Object.entries(properties.options.series)) {
    if (+key >= seriesNum) {
      properties.options.series[key] = properties.options.series[+key + 1];
      delete properties.options.series[+key + 1];
    }
  }

  properties.columns.splice((seriesNum * 3) + 1, 3);
  properties.graphData.forEach(row => row.splice((seriesNum * 3) + 1, 3));

  // Force a refresh of the chart
  properties.columns = [].concat(properties.columns);
}

/** Gets the fake response for the given request */
function getFake(url: string, method: string): any {
  return fakeResponses[url];
}

/** Sets the faked-out test response for the given url. Response should be a JS object that can be stringified */
export function setResponse(url: string, response: any) {
  fakeResponses[url] = response;
}

/** Generate fake data for project 1 */
function fakeProject1(): void {
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
    [Date.parse('5 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 1', RecommenderType.IAM_BINDING, Date.parse('5 Jun 2020 UTC')),
    [Date.parse('9 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 2', RecommenderType.IAM_BINDING, Date.parse('9 Jun 2020 UTC')),
    [Date.parse('17 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 3', RecommenderType.IAM_BINDING, Date.parse('17 Jun 2020 UTC')),
    // Simulate two recommendations on one day
    [Date.parse('17 Jun 2020 UTC') + 1]: new Recommendation(projectId, 'Rec 4', RecommenderType.IAM_BINDING, Date.parse('17 Jun 2020 UTC') + 1),
  }

  let url = `/get-project-data?id="${projectId}"`;
  // Fake out the given url to the generated fake project
  setResponse(url, new ProjectGraphData(projectId, iamBindings, recommendations));
}

/** Generate fake data for project 2 */
function fakeProject2(): void {
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
    [Date.parse('20 Jun 2020 UTC')]: 47,
  };
  let recommendations: { [key: number]: Recommendation } = {
    [Date.parse('1 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 1', RecommenderType.IAM_BINDING, Date.parse('1 Jun 2020 UTC')),
    [Date.parse('9 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 2', RecommenderType.IAM_BINDING, Date.parse('9 Jun 2020 UTC')),
    [Date.parse('20 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 3', RecommenderType.IAM_BINDING, Date.parse('20 Jun 2020 UTC')),
    // Simulate two recommendations on one day
    [Date.parse('20 Jun 2020 UTC') + 1]: new Recommendation(projectId, 'Rec 4', RecommenderType.IAM_BINDING, Date.parse('20 Jun 2020 UTC') + 1),
  }

  let url = `/get-project-data?id="${projectId}"`;
  // Fake out the given url to the generated fake project
  setResponse(url, new ProjectGraphData(projectId, iamBindings, recommendations));
}

/** Generate fake data for project 3 */
function fakeProject3(): void {
  let projectId = 'test-long-project-id-project-3';
  // Fake data for showing the graph
  let iamBindings: { [key: number]: number } = {
    [Date.parse('6 Jun 2020 UTC')]: 125,
    [Date.parse('7 Jun 2020 UTC')]: 201,
    [Date.parse('8 Jun 2020 UTC')]: 177,
    [Date.parse('9 Jun 2020 UTC')]: 111,
    [Date.parse('10 Jun 2020 UTC')]: 212,
    [Date.parse('11 Jun 2020 UTC')]: 190,
    [Date.parse('12 Jun 2020 UTC')]: 184,
    [Date.parse('13 Jun 2020 UTC')]: 137,
    [Date.parse('14 Jun 2020 UTC')]: 124,
    [Date.parse('15 Jun 2020 UTC')]: 205,
    [Date.parse('16 Jun 2020 UTC')]: 182,
    [Date.parse('17 Jun 2020 UTC')]: 109,
    [Date.parse('18 Jun 2020 UTC')]: 191,
    [Date.parse('19 Jun 2020 UTC')]: 211,
    [Date.parse('20 Jun 2020 UTC')]: 213,
    [Date.parse('21 Jun 2020 UTC')]: 177,
    [Date.parse('22 Jun 2020 UTC')]: 136,
    [Date.parse('23 Jun 2020 UTC')]: 193,
    [Date.parse('24 Jun 2020 UTC')]: 153,
    [Date.parse('25 Jun 2020 UTC')]: 187,
  };
  let recommendations: { [key: number]: Recommendation } = {
    [Date.parse('7 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 1', RecommenderType.IAM_BINDING, Date.parse('7 Jun 2020 UTC')),
    [Date.parse('9 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 2', RecommenderType.IAM_BINDING, Date.parse('9 Jun 2020 UTC')),
    [Date.parse('22 Jun 2020 UTC')]: new Recommendation(projectId, 'Rec 3', RecommenderType.IAM_BINDING, Date.parse('22 Jun 2020 UTC')),
    // Simulate two recommendations on one day
    [Date.parse('122 Jun 2020 UTC') + 1]: new Recommendation(projectId, 'Rec 4', RecommenderType.IAM_BINDING, Date.parse('22 Jun 2020 UTC') + 1),
  }

  let url = `/get-project-data?id="${projectId}"`;
  // Fake out the given url to the generated fake project
  setResponse(url, new ProjectGraphData(projectId, iamBindings, recommendations));
}

/** Generate fake data for project 4 */
function fakeProject4(): void {
  let projectId = 'quite-the-long-project-4';
  // Fake data for showing the graph
  let iamBindings: { [key: number]: number } = {
    [Date.parse('1 Jul 2020 UTC')]: 14,
    [Date.parse('2 Jul 2020 UTC')]: 24,
    [Date.parse('3 Jul 2020 UTC')]: 23,
    [Date.parse('4 Jul 2020 UTC')]: 35,
    [Date.parse('5 Jul 2020 UTC')]: 38,
    [Date.parse('6 Jul 2020 UTC')]: 19,
    [Date.parse('7 Jul 2020 UTC')]: 17,
    [Date.parse('8 Jul 2020 UTC')]: 21,
    [Date.parse('9 Jul 2020 UTC')]: 12,
    [Date.parse('10 Jul 2020 UTC')]: 39,
    [Date.parse('11 Jul 2020 UTC')]: 35,
    [Date.parse('12 Jul 2020 UTC')]: 15,
    [Date.parse('13 Jul 2020 UTC')]: 26,
    [Date.parse('14 Jul 2020 UTC')]: 40,
    [Date.parse('15 Jul 2020 UTC')]: 36,
    [Date.parse('16 Jul 2020 UTC')]: 37,
    [Date.parse('17 Jul 2020 UTC')]: 26,
    [Date.parse('18 Jul 2020 UTC')]: 28,
    [Date.parse('19 Jul 2020 UTC')]: 34,
    [Date.parse('20 Jul 2020 UTC')]: 27,
  };
  let recommendations: { [key: number]: Recommendation } = {
    [Date.parse('1 Jul 2020 UTC')]: new Recommendation(projectId, 'Rec 1', RecommenderType.IAM_BINDING, Date.parse('1 Jul 2020 UTC')),
    [Date.parse('9 Jul 2020 UTC')]: new Recommendation(projectId, 'Rec 2', RecommenderType.IAM_BINDING, Date.parse('9 Jul 2020 UTC')),
    [Date.parse('20 Jul 2020 UTC')]: new Recommendation(projectId, 'Rec 3', RecommenderType.IAM_BINDING, Date.parse('20 Jul 2020 UTC')),
    // Simulate two recommendations on one day
    [Date.parse('20 Jul 2020 UTC') + 1]: new Recommendation(projectId, 'Rec 4', RecommenderType.IAM_BINDING, Date.parse('20 Jul 2020 UTC') + 1),
  }

  let url = `/get-project-data?id="${projectId}"`;
  // Fake out the given url to the generated fake project
  setResponse(url, new ProjectGraphData(projectId, iamBindings, recommendations));
}

/** Generate fake data for projects 1 and 2 and sets the appropriate response from request() */
export function fakeProjects(): void {
  let prj1 = new Project('Project 1', 'project-1', 1, new ProjectMetaData(100));
  let prj2 = new Project('Project 2', 'project-2', 2, new ProjectMetaData(70));
  let prj3 = new Project('Test Long Project ID Project 3', 'test-long-project-id-project-3', 3, new ProjectMetaData(173));
  let prj4 = new Project('Quite the Long Project 4', 'quite-the-long-project-4', 4, new ProjectMetaData(33));
  setResponse('/list-project-summaries', [prj1, prj2, prj3, prj4]);
  fakeProject1();
  fakeProject2();
  fakeProject3();
  fakeProject4();
}
