/** Contains various types used by the application. */

/** Properties used by GCharts for rendering. */
export type GraphProperties = {
  options: google.visualization.LineChartOptions;
  graphData: Row[];
  columns: Columns;
  type: 'LineChart';
  title: string;
};

/** The different types of data permitted in a row for Google Charts. */
// Number bindings is a number, tooltip is a string, styling is a string.
export type RowData = string | number;

/** A single row of data in Google Charts. */
export type Row = [Date, RowData?];

/** The format for columns used by Google Charts. */
export type Columns = (string | {type: 'string'; role: 'tooltip' | 'style'})[];
