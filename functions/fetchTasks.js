const { get } = require('https');
const { readFileSync } = require('fs');

const {
  settings: { server },
} = require('../functions/processSettings');

// List all info about taks
const url = '/qrs/task/full';

const options = {
  hostname: server.hostname,
  port: 4242,
  path: `${url}?xrfkey=${server.xrfkey}`,
  method: 'GET',
  rejectUnauthorized: false,
  headers: {
    'X-Qlik-Xrfkey': server.xrfkey,
    'X-Qlik-User': 'UserDirectory= Internal; UserId= sa_repository',
  },
  key: readFileSync('./certs/client_key.pem'),
  cert: readFileSync('./certs/client.pem'),
  ca: readFileSync('./certs/root.pem'),
};

/**
 * Tasks from Qlik's API in the form of a Promise
 *
 * @returns {array}   Array of objects (tasks).
 */
function fetchTasks() {
  return new Promise((resolve, reject) => {
    const request = get(options, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }
      const buffer = [];
      response.on('data', chunk => buffer.push(chunk));
      response.on('end', () => resolve(buffer.join('')));
    });
    request.on('error', err => reject(err));
  });
}

module.exports = {
  fetchTasks,
};
