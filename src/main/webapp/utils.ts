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

/** Whether this is a test or not. */
export const DEFAULT_IS_TEST = true;
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

/** Used internally to dish out fake responses when requested. Effectively a map from URL to response */
const fakeResponses: {[key: string]: Project[] | ProjectGraphData} = {};

/** Sends the given request to HTTP if isTest is false, otherwise fakes out the request */
export async function request(
  url: string,
  method: string,
  body = undefined,
  isTest: boolean = DEFAULT_IS_TEST
): Promise<{json: any}> {
  if (isTest) {
    return new Promise(resolve => {
      const response = getFake(url);
      // When the user calls json() on the promise,
      resolve({json: () => response});
    });
  } else {
    // eslint-disable-next-line no-undef
    return fetch(url, {
      method: method,
      body: JSON.stringify(body),
    });
  }
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

/** Creates the table rows from the given ProjectGraphData The first row contains the column headers */
export function createIamRows(
  graphData: ProjectGraphData[],
  colors: string[] = DEFAULT_COLORS,
  days: Date[] = uniqueDays(graphData)
): any[] {
  // Each row is [time, data1, data1-tooltip, data1-style, data2, data2-tooltip, ...]
  const rows: any[] = [];
  // Add a row for each unique day
  days.forEach(day => rows.push([day]));

  graphData.forEach((data, index) => {
    for (const [key, value] of Object.entries(data.dateToNumberIAMBindings)) {
      // Convert key from string to number
      const date = startOfDay(+key);
      // The row we're adding to is the same index as unique days
      const row =
        rows[days.findIndex(findDate => findDate.getTime() === date.getTime())];

      const recommendations = getRecommendationsOnSameDay(
        +key,
        data.dateToRecommendationTaken
      );
      const tooltip = getTooltip(value, recommendations);
      const point = getPoint(recommendations, colors[index]);

      // Populate the existing row with information
      row.push(value, tooltip, point);
    }
  });

  return rows;
}

/** Creates the column headers for an IAM graph */
export function createIamColumns(graphData: ProjectGraphData[]): any[] {
  const columns: any[] = ['Time'];
  graphData.forEach(data => {
    // Populate the header row, which contains the column purposes
    columns.push(
      data.projectId,
      {type: 'string', role: 'tooltip'},
      {type: 'string', role: 'style'}
    );
  });
  return columns;
}

export function createIamOptions(
  graphData: ProjectGraphData[],
  colors: string[] = DEFAULT_COLORS
): google.visualization.LineChartOptions {
  const options: google.visualization.LineChartOptions = {
    animation: {
      duration: 250,
      easing: 'ease-in-out',
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
  graphData.forEach((data, index) => {
    // TypeScript won't compile without this.
    if (options.series) {
      options.series[index] = {color: colors[index % colors.length]};
    }
  });
  return options;
}

/** Pull the colors from projects into the order of projects in graphData so colors can be assigned easily */
function matchColors(
  graphData: ProjectGraphData[],
  projects: Project[]
): string[] {
  const colors: string[] = [];
  graphData.forEach(data => {
    const project = projects.find(
      project => project.projectId === data.projectId
    );
    if (project) {
      colors.push(project.color);
    }
  });
  return colors;
}

/** Creates the required properties for an IAM graph */
export function createIamGraphProperties(
  graphData: ProjectGraphData[],
  projects: Project[]
): {
  startDate: Date;
  endDate: Date;
  rows: any[];
  columns: any[];
  options: google.visualization.LineChartOptions;
} {
  const days = uniqueDays(graphData);
  const colors = matchColors(graphData, projects);

  const rows = createIamRows(graphData, colors, days);
  const columns = createIamColumns(graphData);
  const options = createIamOptions(graphData, colors);
  return {
    startDate: days[0],
    endDate: days[days.length - 1],
    rows: rows,
    columns: columns,
    options: options,
  };
}

/** Gets the fake response for the given request */
function getFake(url: string): Project[] | ProjectGraphData {
  return fakeResponses[url];
}

/** Sets the faked-out test response for the given url. Response should be a JS object that can be stringified */
export function setResponse(
  url: string,
  response: Project[] | ProjectGraphData
) {
  fakeResponses[url] = response;
}

/** Generate fake data for project 1 */
function fakeProject1(): void {
  const projectId = 'project-1';
  // Fake data for showing the graph
  const iamBindings: {[timeInMillis: number]: number} = {
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
  const recommendations: {[timeInMillis: number]: Recommendation} = {
    [Date.parse('5 Jun 2020 UTC')]: new Recommendation(
      projectId,
      'Rec 1',
      RecommenderType.IAM_BINDING,
      Date.parse('5 Jun 2020 UTC')
    ),
    [Date.parse('9 Jun 2020 UTC')]: new Recommendation(
      projectId,
      'Rec 2',
      RecommenderType.IAM_BINDING,
      Date.parse('9 Jun 2020 UTC')
    ),
    [Date.parse('17 Jun 2020 UTC')]: new Recommendation(
      projectId,
      'Rec 3',
      RecommenderType.IAM_BINDING,
      Date.parse('17 Jun 2020 UTC')
    ),
    // Simulate two recommendations on one day
    [Date.parse('17 Jun 2020 UTC') + 1]: new Recommendation(
      projectId,
      'Rec 4',
      RecommenderType.IAM_BINDING,
      Date.parse('17 Jun 2020 UTC') + 1
    ),
  };

  const url = `/get-project-data?id="${projectId}"`;
  // Fake out the given url to the generated fake project
  setResponse(
    url,
    new ProjectGraphData(projectId, iamBindings, recommendations)
  );
}

/** Generate fake data for project 2 */
function fakeProject2(): void {
  const projectId = 'project-2';
  // Fake data for showing the graph
  const iamBindings: {[timeInMillis: number]: number} = {
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
  const recommendations: {[timeInMillis: number]: Recommendation} = {
    [Date.parse('1 Jun 2020 UTC')]: new Recommendation(
      projectId,
      'Rec 1',
      RecommenderType.IAM_BINDING,
      Date.parse('1 Jun 2020 UTC')
    ),
    [Date.parse('9 Jun 2020 UTC')]: new Recommendation(
      projectId,
      'Rec 2',
      RecommenderType.IAM_BINDING,
      Date.parse('9 Jun 2020 UTC')
    ),
    [Date.parse('20 Jun 2020 UTC')]: new Recommendation(
      projectId,
      'Rec 3',
      RecommenderType.IAM_BINDING,
      Date.parse('20 Jun 2020 UTC')
    ),
    // Simulate two recommendations on one day
    [Date.parse('20 Jun 2020 UTC') + 1]: new Recommendation(
      projectId,
      'Rec 4',
      RecommenderType.IAM_BINDING,
      Date.parse('20 Jun 2020 UTC') + 1
    ),
  };

  const url = `/get-project-data?id="${projectId}"`;
  // Fake out the given url to the generated fake project
  setResponse(
    url,
    new ProjectGraphData(projectId, iamBindings, recommendations)
  );
}

/** Generate fake data for projects 1 and 2 and sets the appropriate response from request() */
export function fakeProjects(): void {
  const prj1 = new Project(
    'Project 1',
    'project-1',
    1,
    new ProjectMetaData(100)
  );
  const prj2 = new Project(
    'Project 2',
    'project-2',
    2,
    new ProjectMetaData(70)
  );
  setResponse('/list-project-summaries', [prj1, prj2]);
  fakeProject1();
  fakeProject2();
}
