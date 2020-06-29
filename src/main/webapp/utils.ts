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

/** Whether this is a test or not. Can be set programatically for CI/CD */
export var defaultIsTest: boolean = true;

/** Used internally to dish out fake responses when requested. Effectively a map from URL to response */
var fakeResponses: { [key: string]: any } = {};

/** Sends the given request to HTTP if isTest is false, otherwise fakes out the request */
export async function request(url: string, method: string, body = undefined, isTest: boolean = defaultIsTest): Promise<Response> {
  if (isTest) {
    return new Promise(resolve => {
      let response = new Response(getFake(url, method));
      resolve(response);
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

/** Returns the tooltip associated with the given IAM Bindings time */
export function getTooltip(time: number, numberBindings: number, dateToRecommendation: { [key: number]: Recommendation }): string {
  // The list of recommendations on the same day
  let matchingRecommendationKeys = Object.keys(dateToRecommendation).filter(val => fallOnSameDay(time, +val));

  if (matchingRecommendationKeys.length === 0) {
    return `IAM Bindings: ${numberBindings}`;
  }

  let tooltip = '';
  matchingRecommendationKeys.forEach(key => {
    tooltip += dateToRecommendation[key].description + '\n';
  });
  return tooltip;
}

/** Create a DataTable object for the given ProjectGraphData */
export function createIamTable(data: ProjectGraphData): google.visualization.DataTable {
  let table = new google.visualization.DataTable();

  table.addColumn('datetime', 'Time');
  table.addColumn('number', 'IAM Bindings');
  // Custom tooltip content
  table.addColumn({ type: 'string', role: 'tooltip' });

  for (const [key, value] of Object.entries(data.dateToNumberIAMBindings)) {
    let date = new Date(0);
    // Convert key from string to number
    date.setTime(+key);
    let tooltip = getTooltip(+key, value, data.dateToRecommendationTaken);
    table.addRow([date, value, tooltip])
  }

  return table;
}

/** Gets the fake response for the given request */
function getFake(url: string, method: string): Blob {
  // Convert the fake response from the given url to a Blob
  return new Blob([JSON.stringify(fakeResponses[url])], { type: 'application/json' });
}

/** Sets the faked-out test response for the given url. Response should be a JS object that can be stringified */
export function setResponse(url: string, response: any) {
  fakeResponses[url] = response;
}
