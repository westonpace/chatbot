import { createNamespace } from 'cls-hooked';
import { User, Guild, GuildMember, Message } from 'discord.js';
import { RequestIdService } from '../../chatbot-base';
import { SessionIdService } from '../../chatbot-base/session/session-id-service';

export const discordContextNamespace = createNamespace('discord-context');
export const CURRENT_USER_KEY = 'CURRENT_USER_KEY';
export const CURRENT_MEMBER_KEY = 'CURRENT_MEMBER_KEY';
export const CURRENT_GUILD_KEY = 'CURRENT_GUILD_KEY';
export const CURRENT_REQUEST_ID_KEY = 'CURRENT_REQUEST_ID_KEY';

export class DiscordContext implements RequestIdService<number>, SessionIdService<string> {

  private requestIdCounter = 0;

  constructor() {

  }

  getCurrentUser() {
    const discordUser = discordContextNamespace.get(CURRENT_USER_KEY) as User;
    if (!discordUser) {
      throw new Error('Attempt to use getCurrentUser when not in namespace context');
    }
    return discordUser;
  }

  getCurrentMember() {
    const discordMember = discordContextNamespace.get(CURRENT_MEMBER_KEY) as GuildMember;
    if (!discordMember) {
      throw new Error('Attempt to use getCurrentMember but context not populated');
    }
    return discordMember;
  }

  getCurrentGuild() {
    const discordGuild = discordContextNamespace.get(CURRENT_GUILD_KEY) as Guild;
    if (!discordGuild) {
      throw new Error('Attempt to use getCurrentGuild but context not populated');
    }
    return discordGuild;
  }

  async getRequestId() {
    const requestId = discordContextNamespace.get(CURRENT_REQUEST_ID_KEY) as number;
    if (requestId === undefined) {
      throw new Error('Attempt to getCurrentRequestId but context not populated');
    }
    return requestId;
  }

  getSessionId() {
    const currentUser = this.getCurrentUser();
    return currentUser.id;
  }
  
  populateWithMessage<T>(message: Message, body: () => Promise<T>) {
    return discordContextNamespace.runPromise(async () => {
      discordContextNamespace.set(CURRENT_REQUEST_ID_KEY, this.requestIdCounter++);
      discordContextNamespace.set(CURRENT_USER_KEY, message.author);
      discordContextNamespace.set(CURRENT_GUILD_KEY, message.guild);
      discordContextNamespace.set(CURRENT_MEMBER_KEY, message.member);
      return body();
    });
  }

}