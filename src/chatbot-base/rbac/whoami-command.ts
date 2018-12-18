import { NoParameters, Command } from '../../chatbot';
import { UserService } from './user-service';
import { Actions } from '../../chatbot/actions';

export class WhoAmICommand implements Command<NoParameters>{

  constructor(private userService: UserService) {

  }

  async execute() {
    const user = await this.userService.getCurrentUser();
    return Actions.reply('You are ' + user.id + ' with roles (' + user.roles.join(', ') + ')');
  }

}