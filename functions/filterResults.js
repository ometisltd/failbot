const { curryRight, filter, flow, includes, concat, indexOf, map } = require('lodash');

const {
  settings: { slack, fetchIntervalMS, taskTypes },
} = require('./processSettings');

function isEnabled(task) {
  return task.enabled;
}

function isValidSchemaPath(task, validSchemaPaths) {
  return includes(validSchemaPaths, task.schemaPath);
}

/**
 * Filters out the tasks that are manually triggered
 * If the task has the custom property 'alertOnSlack' it lets the task through
 */
function isManuallyTriggered(task, propsToMatch) {
  const alertTo = filter(task.customProperties, el => indexOf(propsToMatch, el.definition.name));

  return task.isManuallyTriggered === false || alertTo.length > 0;
}

function isSuccessful(task) {
  return task.operational && task.operational.lastExecutionResult.status !== 7;
}

function inTheLastMilliseconds(task, timeframe) {
  const lastReloaded = new Date(task.operational.lastExecutionResult.stopTime);
  const now = new Date();
  const difference = now - lastReloaded;

  return difference <= timeframe;
}

// function createCustomTaskObject(task) {
//   return {
//     id: task.id,
//     name: task.name,
//     app: {
//       id: task.app.id,
//       name: task.app.name,
//       published: task.app.published,
//     },
//     lastExecution: {
//       status: task.operational.lastExecutionResult.status,
//       statusDescription: executionResultCodes[task.operational.lastExecutionResult.status],
//       startTime: Date.parse(task.operational.lastExecutionResult.startTime),
//       stopTime: Date.parse(task.operational.lastExecutionResult.stopTime),
//     },
//   };
// }

/**
 * Filters tasks based on their properties
 *
 * @param {Object[]} tasks - Array of tasks to be filtered
 * @returns {Object[]} Array of filtered tasks
 */
function filterResults(tasks) {
  const curryFilter = curryRight(filter);
  const parsedTasks = JSON.parse(tasks);
  const customProperties = map(slack, slackTeam => slackTeam.customPropertyName);

  // General task filters
  const preFilterTasks = flow([
    curryFilter(isEnabled),
    curryFilter(isSuccessful),
    curryFilter(task => isValidSchemaPath(task, taskTypes)),
    curryFilter(task => inTheLastMilliseconds(task, fetchIntervalMS)),
  ])(parsedTasks);

  // Specific Reload task filters
  const filteredReloads = flow([
    curryFilter(task => isValidSchemaPath(task, 'ReloadTask')),
    curryFilter(task => isManuallyTriggered(task, customProperties)),
  ])(preFilterTasks);

  // Specific User Sync task filters
  const filteredUserSyncs = flow([curryFilter(task => isValidSchemaPath(task, 'UserSyncTask'))])(
    preFilterTasks
  );

  return concat(filteredReloads, filteredUserSyncs);
}

module.exports = {
  isEnabled,
  isValidSchemaPath,
  isManuallyTriggered,
  isSuccessful,
  inTheLastMilliseconds,
  filterResults,
};
