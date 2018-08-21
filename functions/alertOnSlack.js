const request = require('request');
const { map } = require('lodash');
const log = require('fancy-log');

const {
  settings,
  settings: { server },
} = require('./processSettings');
const msToHuman = require('./helpers/msToHumanReadTime');

/**
 * Sends tasks to Slack in a nice formatted way.
 * Can be customised using settings.json.
 *
 * @param {Object[]} tasks - Tasks to alert
 * @returns {Object[]} The same tasks that have been alerted
 */
function alertOnSlack(target, settingsSlackTeam, slackTeamIndex, tasks) {
  const fetchIntervalSeconds = Math.floor(settings.fetchIntervalMS / 1000);
  const timeframe = msToHuman(fetchIntervalSeconds);
  const serverDisplay = server.externalHostname || server.hostname;

  const body = {
    channel: target,
    icon_emoji: settingsSlackTeam.botEmoji,
    username: settingsSlackTeam.botName,
    text: `*${server.displayName}*: ${tasks.length} task(s) failed in the last ${timeframe}
<https://${serverDisplay}/qmc/tasks|Open tasks on the QMC>`,
    attachments: map(tasks, task => {
      const titleLink =
        task.schemaPath === 'ReloadTask'
          ? `https://${serverDisplay}/sense/app/${task.target.id}`
          : `https://${serverDisplay}/qmc/userdirectoryconnectors`;
      const taskSlack = task.slack[slackTeamIndex];

      return {
        color: taskSlack.color,
        title: `[${task.target.type}] ${task.target.name}`,
        title_link: titleLink,
        fields: [
          {
            title: 'Task Name',
            value: task.name,
            short: true,
          },
          {
            title: 'Status',
            value: `${taskSlack.statusEmoji} ${taskSlack.statusDescription}`,
            short: true,
          },
        ],
        footer: server.displayName,
        footer_icon: settingsSlackTeam.displayIcon,
        ts: task.lastExecution.stopTime / 1000,
      };
    }),
  };

  const options = {
    uri: settingsSlackTeam.webhook,
    method: 'POST',
    json: body,
  };

  request(options, (error, response) => {
    if (!error && response.statusCode === 200) {
      log(`Message delivered to ${target} on Slack`);
    } else if (response.statusCode === 400) {
      log.error('400. Bad request.');
    } else {
      log.warn('HTTP Status', response.statusCode);
    }
  });
}

module.exports = {
  alertOnSlack,
};
