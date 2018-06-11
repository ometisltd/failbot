import { map } from 'lodash';
import toHuman from '../functions/helpers/msToHumanReadTime';

describe('msToHumanReadTime.js', () => {
  describe('#forHumans', () => {
    it('works properly', () => {
      const args = [
        4, // 4 seconds
        61, // 1 minute 1 seconds
        3662, // 1 hour 1 minute 2 seconds
      ];
      const result = map(args, test => toHuman(test));

      expect(result[0]).toBe('4 seconds');
      expect(result[1]).toBe('1 minute 1 second');
      expect(result[2]).toBe('1 hour 1 minute 2 seconds');
    });
  });
});
