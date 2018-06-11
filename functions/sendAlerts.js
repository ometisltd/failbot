const { forEach, union, forIn } = require('lodash');
const log = require('fancy-log');

const { alertOnSlack } = require('./alertOnSlack');
const {
  settings: { slack },
} = require('./processSettings');

function arrangeByReceiver(tasksToArrange, targetChannel, channelIndex) {
  const alerts = {};

  forEach(tasksToArrange, task => {
    // If there are no custom properties then alert to default
    if (task.slack[channelIndex].alertTo.length === 0) {
      alerts[targetChannel] = union(alerts[targetChannel], [task]);
    }

    // Loop through the values of the alertTo property
    forEach(task.slack[channelIndex].alertTo, target => {
      // If it's 'default' the alert to default
      if (target === 'default') {
        alerts[targetChannel] = union(alerts[targetChannel], [task]);
      } else {
        // otherwise, alert to what it's set
        alerts[target] = union(alerts[target], [task]);
      }
    });
  });

  return alerts;
}

/**
 * Receives tasks and sends them to the configured alerting systems.
 * Once they are alerted, it returns the tasks.
 *
 * @param {Object[]} tasks - Arrays of tasks to be alerted
 * @returns {Object[]} Array of alerted tasks
 */
function sendAlerts(tasks) {
  if (tasks.length < 1) {
    return tasks;
  }
  forEach(slack, (slackTeam, slackTeamIndex) => {
    const arrangedTasks = arrangeByReceiver(tasks, slackTeam.channel, slackTeamIndex);

    // send each alert to its channel
    forIn(arrangedTasks, (tasksToAlert, receiver) => {
      log(`Sending ${tasksToAlert.length} task(s) to ${receiver}`);
      alertOnSlack(receiver, slackTeam, slackTeamIndex, tasksToAlert);
    });
  });

  return tasks;
}

module.exports = {
  arrangeByReceiver,
  sendAlerts,
};
