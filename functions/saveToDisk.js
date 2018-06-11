const { createWriteStream, readFileSync } = require('fs');
const { curryRight, orderBy, sortedUniqBy, filter, flow, forEach } = require('lodash');
const log = require('fancy-log');

const {
  settings: { storage, fetchIntervalMS },
} = require('./processSettings');

function inTheLastMilliseconds(task, timeframe) {
  const lastReloaded = new Date(task.lastExecution.stopTime);
  const now = new Date();
  const difference = now - lastReloaded;

  return difference <= timeframe;
}

function purgeTasks(tasks) {
  // second parameter on curryRight indicates arity of the curried function
  const curryOrderBy = curryRight(orderBy, 3);
  const currySortedUniqueBy = curryRight(sortedUniqBy);
  const curryFilter = curryRight(filter);

  return flow([
    curryOrderBy(['id', 'lastExecution.startTime'], ['asc', 'desc']),
    currySortedUniqueBy('id'),
    curryFilter(task => inTheLastMilliseconds(task, fetchIntervalMS * 1.5)),
  ])(tasks);
}

function storeLastRun(dir) {
  const saveToDisk = createWriteStream(dir);
  const lastRun = {
    lastRun: new Date(),
  };

  saveToDisk.write(JSON.stringify(lastRun));
}

/**
 * Saves tasks received and clean the old ones in the process.
 *
 * @param {Object[]} jsonBlob Tasks to be saved
 * @return {Object[]} Tasks received
 */
module.exports = function writeToDisk(jsonBlob) {
  storeLastRun(storage.lastRun);

  // No need to save tasks if no tasks were alerted
  if (jsonBlob.length < 1) {
    return jsonBlob;
  }

  const saveToDisk = createWriteStream(storage.alertedTasks);

  let data = '';
  try {
    data = readFileSync(storage.alertedTasks, 'UTF-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      log.error('App will create a new alerted_tasks.json file.');
    }
  }

  const savedTasks = data ? JSON.parse(data) : [];

  forEach(jsonBlob, task => savedTasks.push(task));

  const tasksToBeSaved = purgeTasks(savedTasks);
  saveToDisk.write(JSON.stringify(tasksToBeSaved));

  return jsonBlob;
};
