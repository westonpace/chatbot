import { NoParameters, Command, Actions, Chatbot, isReply } from "../../chatbot";
import { BriefHelp, DetailedHelp, PrintHelpCommand } from "../../chatbot-base";

describe('Command help tests', () => {

  let commandWithBriefHelp: Command<NoParameters> & BriefHelp = {
    execute: async () => Actions.reply('commandWithBriefHelp'),
    summary: 'abc'
  };
  let commandWithDetailedHelp: Command<NoParameters> & DetailedHelp<{a: number}> = {
    execute: async () => Actions.reply('commandWithDetiledHelp'),
    summary: 'def',
    description: 'description',
    parameters: {
      a: 'blah blah'
    }
  };
  let commandWithNoHelp: Command<NoParameters> = {
    execute: async () => Actions.reply('commandWithNoHelp')
  };
  let chatbot: Chatbot;

  beforeEach(() => {
    chatbot = new Chatbot();
    chatbot.addRoute(commandWithBriefHelp, 'a', 'b', 'c');
    chatbot.addRoute(commandWithDetailedHelp, 'a', 'e');
    chatbot.addRoute(commandWithNoHelp, 'a', 'b', 'd');
    chatbot.addRoute(new PrintHelpCommand(chatbot), 'help');
  });

  it('Should display brief help if multiple commands match', async () => {
    const action = await chatbot.onMessage('help');
    expect(isReply(action)).toBe(true);
    if (isReply(action)) {
      expect(action.messageToSend).toContain('a b c - abc\na e - def');
    }
  });

  it('Should display breif help if only one matches and it is not detailed', async () => {
    const action = await chatbot.onMessage('help a b c');
    expect(isReply(action)).toBe(true);
    if (isReply(action)) {
      expect(action.messageToSend).toContain('a b c - abc');
    }
  });

  it('Should display detailed help if only one matches and it is detailed', async () => {
    const action = await chatbot.onMessage('help a e');
    expect(isReply(action)).toBe(true);
    if (isReply(action)) {
      expect(action.messageToSend).toBe('a e\n\ndescription\na - blah blah');
    }
  });

  it('Should display an appropriate error if no commands were found', async () => {
    const action = await chatbot.onMessage('help blah');
    expect(isReply(action)).toBe(true);
    if (isReply(action)) {
      expect(action.messageToSend).toBe('No commands matched the given prefix');
    }
  });

});