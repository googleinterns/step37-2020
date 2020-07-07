/** Contains various types used by the application */

/** Properties used by GCharts for rendering */
export type GraphProperties = {
  options: google.visualization.LineChartOptions;
  graphData: any[];
  columns: any[];
  type: 'LineChart';
  title: string;
};
