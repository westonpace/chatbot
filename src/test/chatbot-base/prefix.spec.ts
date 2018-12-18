import { Chatbot, Command, Actions, NoParameters, NO_MATCH_ACTION, REPLY_ACTION } from "../../chatbot";
import { PrefixService, PrefixMiddleware, InMemoryPersistentConfigService, PREFIX_CONFIG_KEY, SetPrefixCommand } from "../../chatbot-base";

describe('Prefix service tests', () => {

  let chatbot: Chatbot;
  let prefixService: PrefixService;
  let prefixMiddleware: PrefixMiddleware;
  let replyCommand: Command<NoParameters> = {
    execute: async () => {
        return Actions.reply('hello')
    }
}

  describe('Basic prefix service tests', () => {

    beforeEach(() => {
      chatbot = new Chatbot();
      prefixService = new PrefixService(new InMemoryPersistentConfigService(), 'prefix!');
      prefixMiddleware = new PrefixMiddleware(prefixService);
      chatbot.usePreRouting(prefixMiddleware);
      chatbot.addRoute(replyCommand, 'test');
    });
  
    it('Should ignore commands not matching the prefix', async () => {
      const reply = await chatbot.onMessage('test');
      expect(reply.type).toBe(NO_MATCH_ACTION);
    });
  
    it('Should strip the prefix from the message', async () => {
      const reply = await chatbot.onMessage('prefix! test');
      expect(reply.type).toBe(REPLY_ACTION);
    });
    
  });

  it('Should restore the prefix from config', async () => {
    const configService = new InMemoryPersistentConfigService();
    configService.save(PREFIX_CONFIG_KEY, 'blah');
    const prefixService = new PrefixService(configService, 'prefix!');
    expect(await prefixService.getPrefix()).toBe('blah');
  });

  it('Should allow the prefix to be updated', async () => {
    const configService = new InMemoryPersistentConfigService();
    const prefixService = new PrefixService(configService, 'prefix!');
    const prefixCommand = new SetPrefixCommand(prefixService);
    await prefixCommand.execute({ prefix: 'blah' });
    expect(await prefixService.getPrefix()).toBe('blah');
    expect(await configService.load(PREFIX_CONFIG_KEY)).toBe('blah');
  });

});