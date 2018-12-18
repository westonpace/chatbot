import { Command, Actions } from '../../chatbot';
import { RolesService } from './roles-service';
import { DetailedHelp } from '../../chatbot-base';

export interface BindRoleToRoleParameters {
  botRole: string;
  discordRole: string;
}

export class BindRoleToRoleCommand implements Command<BindRoleToRoleParameters>, DetailedHelp<BindRoleToRoleParameters> {

  summary = 'Binds a bot role to a Discord role';
  description = 'Binds a bot role to a Discord role.  All users that have the discord role will now also have the bot role';
  parameters = {
    botRole: 'The name of the bot role to bind',
    discordRole: 'The name of the discord role to bind'
  }

  constructor(private rolesService: RolesService) {

  }

  async execute(parameters: BindRoleToRoleParameters) {
    if (!this.rolesService.hasRole(parameters.botRole)) {
      return Actions.reply('Could not find a role named ' + parameters.botRole);
    }
    await this.rolesService.bindDiscordRoleToBotRole(parameters.botRole, parameters.discordRole);
    return Actions.reply(`Bound the discord role ${parameters.discordRole} to the bot role ${parameters.botRole}`);
  }

}