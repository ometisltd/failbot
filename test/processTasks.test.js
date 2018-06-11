const { filter, map } = require('lodash');

const { executionResultCodes } = require('../functions/helpers/executionResultCodes');
const pt = require('../functions/processTasks');

describe('processTasks.js', () => {
  describe('#filterCustomPropertyName()', () => {
    const settingsCustomPropertyName = 'alertMe';

    it('custom properties not equal to "settings/customPropertyName" should be filterd out', () => {
      const customProperties = [
        {
          definition: {
            name: 'other Name',
          },
        },
        {
          definition: {},
        },
      ];

      const result = filter(customProperties, cp =>
        pt.filterCustomPropertyName(cp, settingsCustomPropertyName)
      );
      expect(result.length).toBe(0);
    });
    it('custom properties equal to "settings/customPropertyName" should pass', () => {
      const customProperties = [
        {
          definition: {
            name: 'alertMe',
          },
        },
      ];

      const result = filter(customProperties, cp =>
        pt.filterCustomPropertyName(cp, settingsCustomPropertyName)
      );
      expect(result.length).toBe(1);
    });
  });

  describe('#createCustomAlertToObject', () => {
    it('should return the value of the custom property passed onto it', () => {
      const customProperties = [
        {
          value: 'uno',
        },
        {
          value: 'dos',
        },
        {
          value: 'tres',
        },
        {
          value: 'catorce',
        },
      ];
      const result = map(customProperties, pt.createCustomAlertToObject);
      expect(result).toEqual(['uno', 'dos', 'tres', 'catorce']);
    });
  });

  describe('#createCustomTaskObject()', () => {
    const slackProps = [
      {
        customPropertyName: 'alertMe',
      },
    ];
    it('check that all fields and values match on "ReloadTasks"', () => {
      const tasks = [
        {
          id: '1a',
          name: 'test task',
          customProperties: [
            {
              definition: {
                name: 'alertMe',
              },
              value: 'me',
            },
            {
              definition: {
                name: 'alertMe',
              },
              value: 'you',
            },
            {
              definition: {
                name: 'this should be ignored',
              },
              value: ['nothing', 'to', 'see', 'here'],
            },
          ],
          operational: {
            lastExecutionResult: {
              status: 8,
              startTime: new Date(),
              stopTime: new Date(),
            },
          },
          schemaPath: 'ReloadTask',
          isManuallyTriggered: false,
          app: {
            id: '2b',
            name: 'test app',
            published: true,
          },
        },
      ];
      const lastResult = tasks[0].operational.lastExecutionResult;
      const expected = [
        {
          id: '1a',
          name: 'test task',
          lastExecution: {
            status: 8,
            startTime: Date.parse(lastResult.startTime),
            stopTime: Date.parse(lastResult.stopTime),
          },
          schemaPath: 'ReloadTask',
          slack: [
            {
              statusDescription: executionResultCodes[lastResult.status].description,
              statusEmoji: executionResultCodes[lastResult.status].emoji,
              color: executionResultCodes[lastResult.status].color,
              alertTo: ['me', 'you'],
            },
          ],
          isManuallyTriggered: false,
          target: {
            id: '2b',
            name: 'test app',
            type: 'App',
            published: true,
          },
        },
      ];

      const result = map(tasks, task => pt.createCustomTaskObject(task, slackProps));
      expect(result).toEqual(expected);
    });

    it('check that all fields and values match on "UserSyncTasks"', () => {
      const tasks = [
        {
          id: '1a',
          name: 'test task',
          customProperties: [
            {
              definition: {
                name: 'alertMe',
              },
              value: 'me',
            },
            {
              definition: {
                name: 'alertMe',
              },
              value: 'you',
            },
            {
              definition: {
                name: 'this should be ignored',
              },
              value: ['nothing', 'to', 'see', 'here'],
            },
          ],
          operational: {
            lastExecutionResult: {
              status: 8,
              startTime: new Date(),
              stopTime: new Date(),
            },
          },
          schemaPath: 'UserSyncTask',
          userDirectory: {
            id: '2b',
            name: 'test app',
          },
        },
      ];
      const lastResult = tasks[0].operational.lastExecutionResult;
      const expected = [
        {
          id: '1a',
          name: 'test task',
          lastExecution: {
            status: 8,
            startTime: Date.parse(lastResult.startTime),
            stopTime: Date.parse(lastResult.stopTime),
          },
          schemaPath: 'UserSyncTask',
          slack: [
            {
              statusDescription: executionResultCodes[lastResult.status].description,
              statusEmoji: executionResultCodes[lastResult.status].emoji,
              color: executionResultCodes[lastResult.status].color,
              alertTo: ['me', 'you'],
            },
          ],
          target: {
            id: '2b',
            name: 'test app',
            type: 'User Sync',
          },
        },
      ];

      const result = map(tasks, task => pt.createCustomTaskObject(task, slackProps));
      expect(result).toEqual(expected);
    });
  });
});
