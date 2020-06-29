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

/** Whether this is a test or not. Can be set programatically for CI/CD */
export var defaultIsTest: boolean = true;

/** Used internally to dish out fake responses when requested. Effectively a map from URL to response */
var fakeResponses: {[key: string]: any} = {};

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

/** Convert the given map of IAM Bindings to graphdata that's parsable by GCharts */
export function iamBindingsToGraphData(obj: {[key: number]: number}): [[Date, number]] {
  let out = [];

  Object.keys(obj).forEach(key => {
    let date = new Date(0);
    // Convert key from string to number
    date.setTime(+key);
    out.push([date, obj[key]]);
  })
  
  return out as [[Date, number]];
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
