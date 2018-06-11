const _ = require('lodash');
const ps = require('../functions/processSettings');

describe('processSettings.js', () => {
  describe('#slackDefaults', () => {
    it('other properties should not be modified ', () => {
      const slack = [
        {
          webhook: 'https://web.hook.test',
        },
        {
          displayIcon: ':thubms_up:',
        },
        {
          channel: '#general',
        },
        {
          customPropertyName: 'alertMe',
        },
      ];

      const result = ps.slackDefaults(slack);
      _.forEach(result, el => {
        expect(el).toHaveProperty('botName');
        expect(el).toHaveProperty('botEmoji');
      });
    });
    it('does not overwrite botName or botEmoji', () => {
      const slack = [
        {
          botName: 'Silly Name',
        },
        {
          botEmoji: ':warning:',
        },
        {
          botName: 'Look at me',
          botEmoji: ':eye:',
        },
      ];

      const result = ps.slackDefaults(slack);
      expect(result[0]).toHaveProperty('botName', 'Silly Name');
      expect(result[1]).toHaveProperty('botEmoji', ':warning:');
      expect(result[2]).toHaveProperty('botName', 'Look at me');
      expect(result[2]).toHaveProperty('botEmoji', ':eye:');
    });
    it('assigns the default values if empty or property does not exist', () => {
      const slack = [
        {},
        {
          botName: '',
        },
        {
          botEmoji: '',
        },
      ];

      const result = ps.slackDefaults(slack);
      expect(result[0]).toHaveProperty('botName');
      expect(result[0]).toHaveProperty('botEmoji');

      expect(result[0]).not.toHaveProperty('botName', '');
      expect(result[0]).not.toHaveProperty('botEmoji', '');
      expect(result[1]).not.toHaveProperty('botName', '');
      expect(result[2]).not.toHaveProperty('botEmoji', '');
    });
  });
  describe('#outputFolderDefaults', () => {
    it('does not overwrite the folder value', () => {
      const result = ps.outputFolderDefaults('./some-folder/');
      expect(result).toBe('./some-folder/');
    });
    it('returns the default value for folder if empty or undefined', () => {
      const result = [];
      result.push(ps.outputFolderDefaults());
      result.push(ps.outputFolderDefaults(''));
      result.push(ps.outputFolderDefaults(undefined));

      expect(result[0]).not.toBe('');
      expect(result[0]).not.toBe('');
      expect(result[0]).not.toBe(undefined);
    });
  });
});
