import { NoParameters, Command } from '../../chatbot';
import { UserService } from './user-service';
import { Actions } from '../../chatbot/actions';

export class GetRolesCommand implements Command<NoParameters>{

  constructor(private userService: UserService) {

  }

  async execute() {
    const user = await this.userService.getCurrentUser();
    return Actions.reply('Roles: ' + user.roles.join(', '));
  }

}