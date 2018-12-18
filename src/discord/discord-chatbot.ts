import { Client, Message } from 'discord.js';
import { Chatbot, isReply } from '../chatbot';
import { DiscordContext } from './context';

export interface DiscordChatbotErrorHandler {
  onError(err: any): void;
}

export class DiscordChatbot {

  private client: Client | null = null;
  discordContext = new DiscordContext();

  constructor(
    private chatbot: Chatbot,
    private clientSecret: string,
    private errorHandler: DiscordChatbotErrorHandler
    ) {

  }

  initialize() {
    if (this.client !== null) {
      throw new Error('Already initialized');
    }
    let resolveFunc: Function;
    const result = new Promise<void>((resolve) => {
      resolveFunc = resolve;
    });
    this.client = new Client({

    });
    this.client.on('ready', resolveFunc!);
    this.client.on('message', message => this.handleMessage(message));
    this.client.login(this.clientSecret);
    return result;
  }

  async stop() {
    if (this.client) {
      return this.client.destroy();
    }
  }

  private handleMessage(message: Message) {
    this.discordContext.populateWithMessage(message, async () => {
      return this.sendMessage(message);
    }).catch(err => this.errorHandler.onError(err));
  }

  private async sendMessage(message: Message) {
    const responseAction = await this.chatbot.onMessage(message.content);
    if (isReply(responseAction)) {
      message.reply(responseAction.messageToSend);
    }
  }

}