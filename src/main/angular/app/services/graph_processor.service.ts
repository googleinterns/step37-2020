import {Injectable, SimpleChanges} from '@angular/core';
import {ProjectGraphData} from '../../model/project_graph_data';
import {Recommendation} from '../../model/recommendation';
import {Project} from '../../model/project';
import {SimpleChange} from '@angular/core';
import {DateUtilitiesService} from './date_utilities.service';
import {GraphProperties, Columns, Row} from '../../model/types';
import {DataService} from './data.service';
import {DateRange} from '../../model/date_range';
import {CUMULATIVE_BINDINGS_SUFFIX} from '../../constants';

/** Provides methods to convert data to the format used by Google Charts. */
@Injectable()
export class GraphProcessorService {
  /** List of projects with active GET requests to be added to the graph. */
  activeProjects: string[];

  constructor(
    private dateUtilities: DateUtilitiesService,
    private dataService: DataService
  ) {
    this.activeProjects = [];
  }

  /** Initialize the chart properties with empty data. */
  initProperties(): GraphProperties {
    const options: google.visualization.LineChartOptions = {
      animation: {
        duration: 500,
        easing: 'out',
        startup: true,
      },
      legend: {position: 'none'},
      hAxis: {
        gridlines: {
          color: 'white',
        },
        format: 'M/d',
        minTextSpacing: 100,
        viewWindow: {},
      },
      vAxis: {
        minorGridlines: {
          color: 'white',
        },
        title: 'IAM Bindings',
        titleTextStyle: {
          italic: false,
          bold: true,
        },
      },
      tooltip: {
        isHtml: true,
      },
      chartArea: {width: '90%', height: '90%'},
      series: {},
    };
    return {
      options: options,
      graphData: [],
      columns: ['Time'],
      type: 'LineChart',
      width: 960,
      height: 600,
      dateRange: new DateRange(new Date(), new Date()),
    };
  }

  /** Process the given changes and adjust from the graph properties as necessary. */
  processChanges(
    changes: SimpleChanges,
    properties: GraphProperties,
    addCumulativeDifference: boolean
  ): Promise<void> {
    const additionsDeletions = this.getAdditionsDeletions(changes.projects);
    const promises: Promise<unknown>[] = [];

    additionsDeletions.added.forEach(addition => {
      this.activeProjects.push(addition.projectId);
      promises.push(
        this.dataService.getProjectGraphData(addition.projectId).then(data => {
          if (this.activeProjects.includes(data.projectId)) {
            this.addToGraph(
              properties,
              data,
              addition,
              addCumulativeDifference
            );
            this.activeProjects.splice(
              this.activeProjects.indexOf(data.projectId),
              1
            );
          }
        })
      );
    });
    additionsDeletions.removed.forEach(removal => {
      const index = this.activeProjects.indexOf(removal.projectId);
      if (index !== -1) {
        this.activeProjects.splice(index, 1);
      } else {
        this.removeFromGraph(properties, removal, addCumulativeDifference);
      }
    });
    return Promise.all(promises).then();
  }

  /** Adds an extra line with the IAM Bindings as they would be with no recommendations and refreshes the chart. */
  async addCumulativeDifferences(
    properties: GraphProperties,
    projects: Project[]
  ) {
    await Promise.all(
      projects.map(project => this.addCumulativeDifference(properties, project))
    );
  }

  /** Remove all of the cumualtive differences from the graph data and refreshes the chart. */
  removeCumulativeDifferences(
    properties: GraphProperties,
    projects: Project[]
  ) {
    projects.forEach(project => {
      this.removeCumulativeDifference(properties, project);
    });

    this.forceRefresh(properties);
  }

  /** Removes the single cumulative difference curve for the given project. */
  private removeCumulativeDifference(
    properties: GraphProperties,
    project: Project
  ) {
    const index = properties.columns.findIndex(
      value => value === project.projectId + CUMULATIVE_BINDINGS_SUFFIX
    );
    this.removeSeriesOptions(properties, (index - 1) / 3);
    properties.columns.splice(index, 3);
    properties.graphData.forEach(row => row.splice(index, 3));
  }

  /** Adds the cumulative difference curve for the given curve. */
  private async addCumulativeDifference(
    properties: GraphProperties,
    project: Project
  ): Promise<void> {
    const seriesNumber = (properties.columns.length - 1) / 3;
    properties.options.series[seriesNumber] = {
      color: project.color,
      lineDashStyle: [10, 2],
    };

    properties.columns.push(
      project.projectId + CUMULATIVE_BINDINGS_SUFFIX,
      {
        type: 'string',
        role: 'tooltip',
        p: {html: true},
      },
      {
        type: 'string',
        role: 'style',
      }
    );
    // No harm in doing this since the graph data has already been cached
    const data = await this.dataService.getProjectGraphData(project.projectId);

    let cumulativeImpact = 0;
    Object.keys(data.dateToNumberIAMBindings)
      .sort()
      .forEach(time => {
        const date = this.dateUtilities.startOfDay(+time);
        const recommendations = this.getRecommendationsOnSameDay(
          +time,
          data.dateToRecommendationTaken
        );

        const adjustedBindings =
          data.dateToNumberIAMBindings[time] + cumulativeImpact;

        // Add the cumulative impact of the recommendation
        recommendations.forEach(
          recommendation =>
            (cumulativeImpact += recommendation.metadata.impactInIAMBindings)
        );

        const row = this.getRow(properties.graphData, date);
        row.push(
          adjustedBindings,
          this.getTooltip(date, adjustedBindings, recommendations, project),
          this.getPoint(recommendations, project.color, 'square')
        );
      });

    // Now add empty data for rows that weren't touched
    properties.graphData.forEach(row => {
      if (row.length < (seriesNumber + 1) * 3 + 1) {
        row.push(undefined, undefined, undefined);
      }
    });
  }

  /** Adds the given project to the graph. */
  private async addToGraph(
    properties: GraphProperties,
    data: ProjectGraphData,
    project: Project,
    addCumulativeDifference: boolean
  ): Promise<void> {
    const seriesNumber: number = (properties.columns.length - 1) / 3;
    // Set the color and add the new columns
    if (properties.options.series) {
      properties.options.series[seriesNumber] = {color: project.color};
    }
    this.addIamColumns(properties.columns, data);
    // Add the new rows
    this.addIamRows(properties.graphData, data, project, seriesNumber);
    // Modify the date range as appropriate
    properties.dateRange = this.dateUtilities.getDateRange(
      properties.graphData
    );

    if (addCumulativeDifference) {
      await this.addCumulativeDifference(properties, project);
    }

    this.forceRefresh(properties);
  }

  /** Remove the series from options. */
  private removeSeriesOptions(
    properties: GraphProperties,
    seriesNumber: number
  ) {
    if (properties.options.series) {
      for (const [key] of Object.entries(properties.options.series)) {
        if (+key >= seriesNumber && properties.options.series) {
          properties.options.series[+key] = properties.options.series[+key + 1];
          delete properties.options.series[+key + 1];
        }
      }
    }
  }

  /** Removes the given project from the graph. */
  private removeFromGraph(
    properties: GraphProperties,
    project: Project,
    addCumulativeDifference: boolean
  ) {
    const seriesNumber: number =
      (properties.columns.indexOf(project.projectId) - 1) / 3;
    this.removeSeriesOptions(properties, seriesNumber);

    properties.columns.splice(seriesNumber * 3 + 1, 3);
    properties.graphData.forEach(row => row.splice(seriesNumber * 3 + 1, 3));
    if (addCumulativeDifference) {
      this.removeCumulativeDifference(properties, project);
    }
    // Look for rows with empty data and remove them
    properties.graphData = properties.graphData.filter(row =>
      row.some((value, index) => value && index !== 0)
    );

    // Modify the date range as appropriate
    properties.dateRange = this.dateUtilities.getDateRange(
      properties.graphData
    );

    this.forceRefresh(properties);
  }

  /** Adds the table rows for the given Project. Each row is [time, data1, data1-tooltip, data1-style, data2, data2-tooltip, ...] */
  private addIamRows(
    rows: Row[],
    data: ProjectGraphData,
    project: Project,
    seriesNumber: number
  ): Row[] {
    // First, get all the days we need to add if it hasn't already been provided
    const days = this.dateUtilities.uniqueDays([data]);

    // Add a row for each new unique day
    days
      .filter(day => !this.includesDay(rows, day))
      .forEach(day => {
        const row: Row = [day];
        // Fill in columns for all existing projects with empty data
        for (let i = 0; i < seriesNumber * 3; i++) {
          row.push(undefined);
        }
        rows.push(row);
      });

    // Sort rows in increasing order
    rows.sort((a, b) => {
      if (a[0] instanceof Date && b[0] instanceof Date) {
        return a[0].getTime() - b[0].getTime();
      }
      return 0;
    });

    for (const [key, value] of Object.entries(data.dateToNumberIAMBindings)) {
      // Convert key from string to number
      const date = this.dateUtilities.startOfDay(+key);
      // The row we're adding to is the same index as unique days
      const row = this.getRow(rows, date);

      const recommendations = this.getRecommendationsOnSameDay(
        +key,
        data.dateToRecommendationTaken
      );
      const tooltip = this.getTooltip(date, value, recommendations, project);
      const point = this.getPoint(recommendations, project.color, 'circle');

      if (row) {
        // Populate the existing row with information
        row.push(value, tooltip, point);
      }
    }

    // Now add empty data for rows that weren't touched
    rows.forEach(row => {
      if (row.length < (seriesNumber + 1) * 3 + 1) {
        row.push(undefined, undefined, undefined);
      }
    });

    return rows;
  }

  /** Adds the column headers for a single project on an IAM graph. Takes the form of [time, data1, data1-tooltip, data1-style, data2, data2-tooltip, ...] */
  private addIamColumns(columns: Columns, data: ProjectGraphData): void {
    // Populate the header row, which contains the column purposes
    columns.push(
      data.projectId,
      {type: 'string', role: 'tooltip', p: {html: true}},
      {type: 'string', role: 'style'}
    );
  }

  /** From a given SimpleChange, extract the projects that were added or deleted. */
  private getAdditionsDeletions(
    change: SimpleChange
  ): {added: Project[]; removed: Project[]} {
    const out: {added: Project[]; removed: Project[]} = {
      added: [],
      removed: [],
    };
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

  /** Returns the tooltip associated with the given IAM Bindings time */
  private getTooltip(
    date: Date,
    numberBindings: number,
    matchingRecommendations: Recommendation[],
    project: Project
  ): string {
    // Add the date to tooltip
    let tooltip = `<table style="border: 1px solid ${project.color}">`;
    tooltip += `<tr><th><b style="color: ${project.color}">${project.projectId}</b><br/>`;
    tooltip += `<b>${date.toLocaleDateString()}</b></th></tr>`;

    // The list of recommendations on the same day
    if (matchingRecommendations.length === 0) {
      tooltip += `<tr><td style="border-top: 1px solid ${project.color};">IAM Bindings: ${numberBindings}</td></tr>`;
    }

    matchingRecommendations.forEach(recommendation => {
      tooltip += `<tr class="tooltip-row"><td style="border-top: 1px solid ${project.color};">`;

      tooltip += `${recommendation.actor} accepted:<br/>`;
      recommendation.actions.forEach(action => {
        let actionText: string;

        if (action.newRole.length > 0) {
          // Role was replaced
          actionText = `Replace ${action.previousRole} with ${action.newRole} on ${action.affectedAccount}.`;
        } else {
          // Role was removed
          actionText = `Remove ${action.previousRole} from ${action.affectedAccount}.`;
        }

        tooltip += `${actionText}<br/>`;
      });
      tooltip += `Removing ${recommendation.metadata.impactInIAMBindings} IAM Bindings`;
      tooltip += '</td></tr>';
    });

    tooltip += '</table>';
    return tooltip;
  }

  /** Returns the point styling associated with the given recommendation. */
  private getPoint(
    matchingRecommendations: Recommendation[],
    color: string,
    shape: string
  ): string | undefined {
    if (matchingRecommendations.length === 0) {
      return undefined;
    }
    return `point { size: 10; shape-type: ${shape}; fill-color: ${color}; visible: true; }`;
  }

  /** Returns the recommendations which occured on the same day as the given time, which is in milliseconds since epoch. */
  private getRecommendationsOnSameDay(
    time: number,
    dateToRecommendation: {[timeInMillis: number]: Recommendation}
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    for (const [key, value] of Object.entries(dateToRecommendation)) {
      if (this.dateUtilities.fallOnSameDay(time, +key)) {
        recommendations.push(value);
      }
    }
    return recommendations;
  }

  /** Checks if the rows already includes the given day. */
  private includesDay(rows: Row[], day: Date): boolean {
    return (
      rows.findIndex(row => {
        if (row[0] instanceof Date) {
          return row[0].getTime() === day.getTime();
        }
        return false;
      }) !== -1
    );
  }

  /** Returns the row representing the given day. */
  private getRow(rows: Row[], day: Date): Row | undefined {
    return rows.find(row => {
      if (row[0] instanceof Date) {
        return row[0].getTime() === day.getTime();
      }
      return false;
    });
  }

  /** Force a refresh of google charts. */
  private forceRefresh(properties: GraphProperties) {
    const temp: Columns = [];
    properties.columns = temp.concat(properties.columns);
  }
}
