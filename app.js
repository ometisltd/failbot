const { flow } = require('lodash');
const { error } = require('fancy-log');

const { fetchTasks } = require('./functions/fetchTasks');
const { filterResults } = require('./functions/filterResults');
const { processTasks } = require('./functions/processTasks');
const { sendAlerts } = require('./functions/sendAlerts');
const saveToDisk = require('./functions/saveToDisk');
const { fetchSavedAlerts } = require('./functions/fetchSavedAlerts');
const { checkAgainstAlerted } = require('./functions/checkAgainstAlerted');

function app(tasks) {
  flow([
    filterResults,
    processTasks,
    fetchSavedAlerts,
    checkAgainstAlerted,
    sendAlerts,
    saveToDisk,
  ])(tasks);
}

function fetchFromAPI() {
  fetchTasks()
    .then(tasks => app(tasks))
    .catch(err =>
      error(`Could not fetch tasks from the API.
       | Check the hostname for errors: ${err.host}
       | Full error: ${err}`)
    );
}

fetchFromAPI();
