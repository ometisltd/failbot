import { filter } from 'lodash';
import {
  isEnabled,
  isValidSchemaPath,
  isManuallyTriggered as _isManuallyTriggered,
  isSuccessful,
  inTheLastMilliseconds,
} from '../functions/filterResults';

describe('filterResults.js', () => {
  describe('#isEnabled()', () => {
    it('disabled task should be filtered out', () => {
      const tasks = [
        {
          enabled: false,
        },
      ];
      const result = filter(tasks, isEnabled);
      expect(result.length).toBe(0);
    });

    it('enabled taskshould pass through', () => {
      const tasks = [
        {
          enabled: true,
        },
      ];
      const result = filter(tasks, isEnabled);
      expect(result.length).toBe(1);
    });
  });
  describe('#isValidSchemaPath()', () => {
    const settingsTaskTypes = ['ReloadTask', 'UserSyncTask'];
    it('when schemaPath is not in "settings/taskTypes" it should be filtered out', () => {
      const tasks = [
        {
          schemaPath: 'OtherReloadTask',
        },
        {
          notRelatedProperty: 'ReloadTask',
        },
        {
          schemaPath: false,
        },
        {
          schemaPath: 1234,
        },
        {
          // only this one should pass
          schemaPath: 'UserSyncTask',
        },
      ];
      const result = filter(tasks, task => isValidSchemaPath(task, settingsTaskTypes));
      expect(result.length).toBe(1);
    });

    it('when is schemaPath is in "settings/taskTypes" it should pass', () => {
      const tasks = [
        {
          schemaPath: 'ReloadTask',
        },
        {
          schemaPath: 'UserSyncTask',
        },
      ];
      const result = filter(tasks, task => isValidSchemaPath(task, settingsTaskTypes));
      expect(result.length).toBe(2);
    });
  });
  describe('#isManuallyTriggered()', () => {
    it('manually triggered tasks should be filtered out', () => {
      const tasks = [
        {
          isManuallyTriggered: true,
        },
      ];
      const result = filter(tasks, _isManuallyTriggered);
      expect(result.length).toBe(0);
    });

    it('non manually triggered tasks should pass', () => {
      const tasks = [
        {
          isManuallyTriggered: false,
        },
      ];
      const result = filter(tasks, _isManuallyTriggered);
      expect(result.length).toBe(1);
    });
    it('if a custom property matches "settings/customPropertyName" it should always pass', () => {
      const slackCustomProperties = ['alertTo', 'alertToMeToo'];
      const tasks = [
        {
          isManuallyTriggered: true,
          customProperties: [
            {
              definition: {
                name: 'alertTo',
              },
            },
          ],
        },
        {
          isManuallyTriggered: true,
          customProperties: [
            {
              definition: {
                name: 'alertToMeToo',
              },
            },
          ],
        },
        {
          isManuallyTriggered: false,
          customProperties: [
            {
              definition: {
                name: 'I should pass',
              },
            },
          ],
        },
        {
          isManuallyTriggered: true,
          customProperties: [
            {
              definition: {
                name: 'I should be filtered out',
              },
            },
          ],
        },
      ];
      const result = filter(tasks, task => _isManuallyTriggered(task, slackCustomProperties));
      expect(result.length).toBe(3);
    });
  });
  describe('#isSuccessful()', () => {
    it('successful tasks should be filtered out', () => {
      const tasks = [
        {
          operational: {
            lastExecutionResult: {
              status: 7,
            },
          },
        },
      ];
      const result = filter(tasks, isSuccessful);
      expect(result.length).toBe(0);
    });

    it('other results should pass', () => {
      const tasks = [
        {
          operational: {
            lastExecutionResult: {
              status: 0,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 1,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 2,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 3,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 4,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 5,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 6,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 8,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 9,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 10,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 11,
            },
          },
        },
        {
          operational: {
            lastExecutionResult: {
              status: 12,
            },
          },
        },
      ];
      const result = filter(tasks, isSuccessful);
      expect(result.length).toBe(12);
    });
  });
  describe('#inTheLastMilliseconds()', () => {
    it('finihed outside the defined timespan should be filtered out', () => {
      const tasks = [
        {
          operational: {
            lastExecutionResult: {
              stopTime: new Date() - 60 * 1000,
            },
          },
        },
      ];
      const result = filter(tasks, task => inTheLastMilliseconds(task, 10 * 1000));
      expect(result.length).toBe(0);
    });
    it('finihed within the defined timespan should pass', () => {
      const tasks = [
        {
          operational: {
            lastExecutionResult: {
              stopTime: new Date() - 60 * 1000,
            },
          },
        },
      ];
      const result = filter(tasks, task => inTheLastMilliseconds(task, 120 * 1000));
      expect(result.length).toBe(1);
    });
  });
});
