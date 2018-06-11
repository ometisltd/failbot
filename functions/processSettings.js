const settings = require('../settings.json');
const { readFileSync, existsSync, mkdirSync } = require('fs');
const log = require('fancy-log');
const { clone, forEach } = require('lodash');

function slackDefaults(endpoints) {
  const newEndPoint = clone(endpoints);
  forEach(endpoints, (el, i) => {
    if (!el.botName) {
      newEndPoint[i].botName = 'Failbot for Qlik';
    }
    if (!el.botEmoji) {
      newEndPoint[i].botEmoji = ':warning:';
    }
  });

  return newEndPoint;
}

function outputFolderDefaults(folder) {
  if (!folder) {
    return './output';
  }

  return folder;
}

function checkOutputFolder(folder) {
  if (!existsSync(folder)) {
    log(`Creating output folder at '${folder}'`);
    mkdirSync(folder);
  }
}

function processOutputFolder(folder) {
  return {
    alertedTasks: `${folder}/alerted_tasks.json`,
    lastRun: `${folder}/last_run.json`,
  };
}

function getLastRun() {
  let data = '';
  try {
    data = readFileSync(`${settings.storage.lastRun}`, 'UTF-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      log.error('App will create a new last_run.json file.');
    }
  }

  // Default to 10 minutes
  const result = data ? JSON.parse(data).lastRun : new Date() - 1000 * 60 * 10;

  return result;
}

function calculateInterval(previousRun) {
  return new Date() - previousRun;
}

function processSettings() {
  // Slack
  settings.slack = slackDefaults(settings.slack);

  // Output folder
  settings.logOutputFolder = outputFolderDefaults(settings.logOutputFolder);
  checkOutputFolder(settings.logOutputFolder);
  settings.storage = processOutputFolder(settings.logOutputFolder);

  // Fetch interval
  settings.fetchIntervalMS = calculateInterval(new Date(getLastRun()));
}

processSettings();

module.exports = {
  slackDefaults,
  outputFolderDefaults,
  checkOutputFolder,
  processOutputFolder,
  getLastRun,
  calculateInterval,
  processSettings,
  settings,
};
