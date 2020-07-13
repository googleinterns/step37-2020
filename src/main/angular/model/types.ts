/** Contains various types used by the application. */

/** Properties used by GCharts for rendering. */
export type GraphProperties = {
  options: google.visualization.LineChartOptions;
  graphData: Row[];
  columns: Columns;
  type: 'LineChart';
  width: number;
  height: number;
  dateRange: DateRange;
};

/** The different types of data permitted in a row for Google Charts. */
// Timestamp is a date, number bindings is a number, tooltip is a string, styling is a string.
// A row is undefined if there is no data (i.e. series is not active at that point in time)
export type RowData = Date | string | number | undefined;

/** A single row of data in Google Charts. */
export type Row = RowData[];

/** The format for columns used by Google Charts. */
export type Columns = (
  | string
  | {type: 'string'; role: 'tooltip' | 'style'; p?: {html: boolean}}
)[];

/** Represents a range of dates */
export type DateRange = {start: Date; end: Date};
