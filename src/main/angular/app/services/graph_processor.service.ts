import {Injectable, SimpleChanges} from '@angular/core';
import {ProjectGraphData} from '../../model/project_graph_data';
import {Recommendation} from '../../model/recommendation';
import {Project} from '../../model/project';
import {SimpleChange} from '@angular/core';
import {DateUtilitiesService} from './date_utilities.service';
import {GraphProperties, Columns, Row} from '../../model/types';
import {DataService} from './data.service';
import {ErrorMessage} from '../../model/error_message';
import {ErrorMessageService} from './error_message.service';

/** Provides methods to convert data to the format used by Google Charts. */
@Injectable()
export class GraphProcessorService {
  constructor(
    private dateUtilities: DateUtilitiesService,
    private errorService: ErrorMessageService
  ) {}

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
      },
      vAxis: {
        minorGridlines: {
          color: 'white',
        },
      },
      series: {},
    };
    return {
      options: options,
      graphData: [],
      columns: ['Time'],
      type: 'LineChart',
      title: 'Empty Graph',
      width: 960,
      height: 600,
    };
  }

  /** Process the given changes and adjust from the graph properties as necessary.
   * Redirects to the error page if an error occured. */
  processChanges(
    changes: SimpleChanges,
    properties: GraphProperties,
    dataService: DataService
  ): Promise<void> {
    const additionsDeletions = this.getAdditionsDeletions(changes.projects);
    const promises: Promise<boolean | ErrorMessage>[] = [];

    additionsDeletions.added.forEach(addition =>
      promises.push(
        dataService
          .getProjectGraphData(addition.projectId)
          .then(data => this.addToGraph(properties, data, addition))
      )
    );
    additionsDeletions.removed.forEach(removal =>
      this.removeFromGraph(properties, removal)
    );
    return Promise.all(promises).then(
      (statuses: (boolean | ErrorMessage)[]) => {
        const errors: ErrorMessage[] = statuses.filter(
          status => status instanceof ErrorMessage
        ) as ErrorMessage[];
        properties.title = 'IAM Bindings';
        if (errors.length > 0) {
          this.errorService.setErrors(errors);
        }
      }
    );
  }

  /** Adds the given project to the graph. Returns false if the given data was an error. */
  private addToGraph(
    properties: GraphProperties,
    data: ProjectGraphData | ErrorMessage,
    project: Project
  ): boolean | ErrorMessage {
    if (data instanceof ProjectGraphData) {
      const seriesNumber: number = (properties.columns.length - 1) / 3;
      // Set the color and add the new columns
      if (properties.options.series) {
        properties.options.series[seriesNumber] = {color: project.color};
      }
      this.addIamColumns(properties.columns, data);
      // Add the new rows
      this.addIamRows(properties.graphData, data, project, seriesNumber);

      // Force a refresh of the chart
      const temp: Columns = [];
      properties.columns = temp.concat(properties.columns);
      return true;
    } else {
      return data as ErrorMessage;
    }
  }

  /** Removes the given project from the graph. */
  private removeFromGraph(properties: GraphProperties, project: Project) {
    const seriesNumber: number =
      (properties.columns.indexOf(project.projectId) - 1) / 3;

    if (properties.options.series) {
      for (const [key] of Object.entries(properties.options.series)) {
        if (+key >= seriesNumber && properties.options.series) {
          properties.options.series[+key] = properties.options.series[+key + 1];
          delete properties.options.series[+key + 1];
        }
      }
    }

    properties.columns.splice(seriesNumber * 3 + 1, 3);
    properties.graphData.forEach(row => row.splice(seriesNumber * 3 + 1, 3));

    // Force a refresh of the chart
    const temp: Columns = [];
    properties.columns = temp.concat(properties.columns);
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
      const tooltip = this.getTooltip(value, recommendations);
      const point = this.getPoint(recommendations, project.color);

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
      {type: 'string', role: 'tooltip'},
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

  /** Returns the point styling associated with the given recommendation. */
  private getPoint(
    matchingRecommendations: Recommendation[],
    color: string
  ): string | undefined {
    if (matchingRecommendations.length === 0) {
      return undefined;
    }
    return `point { size: 10; shape-type: circle; fill-color: ${color}; visible: true; }`;
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
}
