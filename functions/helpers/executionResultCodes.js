// Extracted from:
// https://help.qlik.com/en-US/sense-developer/Subsystems/RepositoryServiceAPI/Content/RepositoryServiceAPI/RepositoryServiceAPI-About-API-Get-Enums.htm
const executionResultCodes = {
  0: {
    name: 'NeverStarted',
    description: 'Never Started',
    color: '#f00',
    emoji: '',
  },
  1: {
    name: 'Triggered',
    description: 'Triggered',
    color: '#f00',
    emoji: '',
  },
  2: {
    name: 'Started',
    description: 'Started',
    color: '#f00',
    emoji: '',
  },
  3: {
    name: 'Queued',
    description: 'Queued',
    color: '#f00',
    emoji: '',
  },
  4: {
    name: 'AbortInitiated',
    description: 'Abort Initiated',
    color: '#FF9800',
    emoji: ':white_square_button:',
  },
  5: {
    name: 'Aborting',
    description: 'Aborting',
    color: '#FF9800',
    emoji: ':white_square_button:',
  },
  6: {
    name: 'Aborted',
    description: 'Aborted',
    color: '#FF9800',
    emoji: ':white_square_button:',
  },
  7: {
    name: 'FinishedSuccess',
    description: 'Success',
    color: '#26aa79',
    emoji: ':white_check_mark:',
  },
  8: {
    name: 'FinishedFail',
    description: 'Failed',
    color: '#aa2657',
    emoji: ':x:',
  },
  9: {
    name: 'Skipped',
    description: 'Skipped',
    color: '#f00',
    emoji: '',
  },
  10: {
    name: 'Retry',
    description: 'Retry',
    color: '#607D8B',
    emoji: ':arrows_counterclockwise:',
  },
  11: {
    name: 'Error',
    description: 'Error',
    color: '#aa2657',
    emoji: ':x:',
  },
  12: {
    name: 'Reset',
    description: 'Reset',
    color: '#607D8B',
    emoji: ':arrows_counterclockwise:',
  },
};

module.exports = {
  executionResultCodes,
};
