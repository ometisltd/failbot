const { map, reject, includes } = require('lodash');

/**
 * Check tasks against saved tasks and discard the matching ones.
 *
 *  @param   {Object}   tasks               Object cointaining tasksToAlert and alertedTasks
 *
 *  @param   {Object[]} tasks.tasksToAlert  Array of current tasks to be checked
 *  @param   {Object[]} tasks.alertedTasks  Array of alerted tasks to be ignored
 *  @returns {Object[]}                     Array of tasks that pass the test
 */
function checkAgainstAlerted({ tasksToAlert: current, alertedTasks }) {
  const ids = map(alertedTasks, task => task.id);
  const startTimes = map(alertedTasks, task => task.lastExecution.startTime);

  const tasksToAlert = reject(
    current,
    task => includes(ids, task.id) && includes(startTimes, task.lastExecution.startTime)
  );

  return tasksToAlert;
}

module.exports = { checkAgainstAlerted };
