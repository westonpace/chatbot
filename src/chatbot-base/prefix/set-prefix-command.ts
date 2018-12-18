import { ResponseAction, Command } from '../../chatbot';

import { PrefixService } from './prefix-service';
import { Actions } from '../../chatbot/actions';
import { DetailedHelp } from '../help';

export const SET_PREFIX_COMMAND_ALIAS = 'SET_PREFIX_COMMAND_ALIAS';

export interface SetPrefixParameters {
  prefix: string;
}

export class SetPrefixCommand implements Command<SetPrefixParameters>, DetailedHelp<SetPrefixParameters> {
  description = 'Sets the bot\'s prefix.  Messages that do not start with this prefix and are not direct messages to the bot will be ignored.';
  parameters = {
    prefix: 'The new prefix'
  };
  summary = 'Sets the bot\'s prefix';

  alias = SET_PREFIX_COMMAND_ALIAS;

  async execute(parameters: SetPrefixParameters): Promise<ResponseAction> {
    if (!parameters.prefix || parameters.prefix.length === 0) {
      return Actions.reply('You must specify a prefix');
    }
    await this.prefixService.setPrefix(parameters.prefix);
    return Actions.reply(`Prefix updated to ${parameters.prefix}`);
  }

  constructor(private prefixService: PrefixService) {

  }

}