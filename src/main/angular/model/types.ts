/** Contains various types used by the application. */

/** Properties used by GCharts for rendering. */
export type GraphProperties = {
  options: google.visualization.LineChartOptions;
  graphData: Row[];
  columns: Columns;
  type: 'LineChart';
  title: string;
  width: number;
  height: number;
};

/** The different types of data permitted in a row for Google Charts. */
// Timestamp is a date, number bindings is a number, tooltip is a string, styling is a string.
export type RowData = Date | string | number | undefined;

/** A single row of data in Google Charts. */
export type Row = RowData[];

/** The format for columns used by Google Charts. */
export type Columns = (string | {type: 'string'; role: 'tooltip' | 'style'})[];
