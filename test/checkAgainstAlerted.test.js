import { checkAgainstAlerted } from '../functions/checkAgainstAlerted';

describe('checkAgainstAlerted.js', () => {
  describe('#checkAgainstAlerted()', () => {
    const testStartTime = new Date();

    const tasks = [
      {
        id: '1',
        lastExecution: {
          startTime: testStartTime,
        },
      },
    ];

    const alertedTasks = [
      {
        id: '1',
        lastExecution: {
          startTime: testStartTime,
        },
      },
    ];

    const emptyAlertedTasks = [];
    const moreTasks = [
      ...tasks,
      {
        id: '2',
        lastExecution: {
          startTime: new Date(9999 ** 3),
        },
      },
    ];

    it('should reject alerted tasks', () => {
      const result = checkAgainstAlerted({ tasksToAlert: tasks, alertedTasks });
      expect(result.length).toBe(0);
    });

    it('should alert new tasks', () => {
      const resultToBe1 = checkAgainstAlerted({
        tasksToAlert: moreTasks,
        alertedTasks,
      });
      const resultToBe2 = checkAgainstAlerted({
        tasksToAlert: moreTasks,
        alertedTasks: emptyAlertedTasks,
      });

      expect(resultToBe1.length).toBe(1);
      expect(resultToBe2.length).toBe(2);
    });
  });
});
