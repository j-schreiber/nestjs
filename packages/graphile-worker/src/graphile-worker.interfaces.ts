export interface GraphileWorkerConfig {
  /**
   * The postgres database connection string
   */
  connectionString: string;

  concurrency?: number;
  noHandleSignals?: boolean;

  /**
   * The frequency with which new jobs should be checked
   */
  pollInterval?: string;
}
