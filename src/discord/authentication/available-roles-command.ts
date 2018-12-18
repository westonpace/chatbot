import { NoParameters, Command, Actions } from '../../chatbot';
import { BriefHelp } from '../../chatbot-base';
import { RolesService } from './roles-service';

export class AvailableRolesCommand implements Command<NoParameters>, BriefHelp {

  summary = 'Prints the bot roles';

  constructor(private rolesService: RolesService) {

  }

  async execute() {
    return Actions.reply('Available roles: ' + Array.from(this.rolesService.getAllRoles()).join(', '));
  }

}