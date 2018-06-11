const { readFileSync, existsSync } = require('fs');
const log = require('fancy-log');

const {
  settings: {
    storage: { alertedTasks: URI },
  },
} = require('./processSettings');

/**
 * If exists, read file containing previously alerted tasks and parse its contents.
 * @param   {Object[]} tasksToAlert List of the tasks to be alerted
 * @returns {Object}                Object containing tasksToAlert and the previously alerted tasks
 */
function fetchSavedAlerts(tasksToAlert) {
  // If the file exists return parsed contents
  if (existsSync(URI)) {
    return { tasksToAlert, alertedTasks: JSON.parse(readFileSync(URI, 'UTF-8')) };
  }

  // otherwise return empty array
  log.error('Log file not found');
  return { tasksToAlert, alertedTasks: [] };
}

module.exports = { fetchSavedAlerts };
