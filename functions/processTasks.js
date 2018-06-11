const { curryRight, map, filter, flow } = require('lodash');

const { executionResultCodes } = require('./helpers/executionResultCodes');
const {
  settings: { slack },
} = require('./processSettings');

function filterCustomPropertyName(customProperty, propName) {
  return customProperty.definition.name === propName;
}

function createCustomAlertToObject(customProperty) {
  return customProperty.value;
}

function createCustomTaskObject(task, slackProperties) {
  const curryFilter = curryRight(filter);
  const curryMap = curryRight(map);

  const lastResult = task.operational.lastExecutionResult;
  const result = {
    id: task.id,
    name: task.name,
    lastExecution: {
      status: lastResult.status,
      startTime: Date.parse(lastResult.startTime),
      stopTime: Date.parse(lastResult.stopTime),
    },
    schemaPath: task.schemaPath,
    slack: map(slackProperties, slackTeam => ({
      statusDescription: executionResultCodes[lastResult.status].description,
      statusEmoji: executionResultCodes[lastResult.status].emoji,
      color: executionResultCodes[lastResult.status].color,
      alertTo: flow([
        curryFilter(prop => filterCustomPropertyName(prop, slackTeam.customPropertyName)),
        curryMap(createCustomAlertToObject),
      ])(task.customProperties),
    })),
  };

  if (task.schemaPath === 'ReloadTask') {
    result.isManuallyTriggered = task.isManuallyTriggered;
    result.target = {
      id: task.app.id,
      name: task.app.name,
      type: 'App',
      published: task.app.published,
    };
  } else if (task.schemaPath === 'UserSyncTask') {
    result.target = {
      id: task.userDirectory.id,
      name: task.userDirectory.name,
      type: 'User Sync',
    };
  }

  return result;
}

/**
 * Modifies the structure of the tasks object to better fit the needs of alerting
 *
 * @param {Object[]} tasks - Array of tasks to be processed
 * @returns {Object[]} Array of processed tasks
 */
function processTasks(tasks) {
  return map(tasks, task => createCustomTaskObject(task, slack));
}

module.exports = {
  filterCustomPropertyName,
  createCustomAlertToObject,
  createCustomTaskObject,
  processTasks,
};
