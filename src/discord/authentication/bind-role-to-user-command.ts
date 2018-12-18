import { Command, Actions } from '../../chatbot';
import { RolesService } from './roles-service';

export interface BindRoleToUserParameters {
  botRole: string;
  userId: string;
}

export class BindRoleToUserCommand implements Command<BindRoleToUserParameters> {

  constructor(private rolesService: RolesService) {

  }

  async execute(parameters: BindRoleToUserParameters) {
    await this.rolesService.bindUserToBotRole(parameters.userId, parameters.botRole);
    return Actions.reply(`Bound the discord user with id ${parameters.userId} to the bot role ${parameters.botRole}`);
  }

}
