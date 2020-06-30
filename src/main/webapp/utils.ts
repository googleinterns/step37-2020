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

/** Whether this is a test or not. */
export var defaultIsTest: boolean = true;
export var defaultColors: string[] = ['#3c78d8', '#cc0000', '#ff9900'];

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

/** Creates the table rows from the given ProjectGraphData */
export function createIamRows(graphData: ProjectGraphData[]): any[] {
  // First, get all the days we need to add
  let days = uniqueDays(graphData);
  // Each row is [time, data1, data1-tooltip, data1-style, data2, data2-tooltip, ...]
  let rows = [];
  let rowSize = 1 + graphData.length * 3;
  days.forEach(day => {
    let row = [day];
    // Populate the row with empty data to start
    for (let i = 1; i < rowSize; i++) {
      row.push(undefined);
    }
    rows.push([day]);
  });

  // The index of the column for each row to start on, since all series are stored in the same row
  let currIndex = 1;
  graphData.forEach(data => {
    for (const [key, value] of Object.entries(data.dateToNumberIAMBindings)) {
      // Convert key from string to number
      let date = startOfDay(+key);
      // The row we're adding to is the same index as in unique days
      let row = rows[days.findIndex(findDate => findDate.getTime() === date.getTime())];

      let recommendations = getRecommendations(+key, data.dateToRecommendationTaken);
      let tooltip = getTooltip(value, recommendations);
      let point = getPoint(recommendations, defaultColors[0]);

      // Populate the existing row with information
      row[currIndex] = value;
      row[currIndex + 1] = tooltip;
      row[currIndex + 2] = point;
    }
    currIndex += 3
  });



  return rows;
}

/** Gets the fake response for the given request */
function getFake(url: string, method: string): Blob {
  return fakeResponses[url];
}

/** Sets the faked-out test response for the given url. Response should be a JS object that can be stringified */
export function setResponse(url: string, response: any) {
  fakeResponses[url] = response;
}
