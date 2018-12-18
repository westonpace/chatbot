import { NoParameters, Command } from '../../chatbot/command';
import { RolesService } from '../../discord';
import { UserService } from './user-service';
import { Actions } from '../../chatbot/actions';
import { SessionStorageService } from '../session';

const CLAIMED_KEY = 'CLAIMED_KEY';

export class ClaimCommand implements Command<NoParameters> {

  constructor(
    private rolesService: RolesService,
    private userService: UserService,
    private sessionStorageService: SessionStorageService<any>,
    private roleToGrant: string
    ) {

  }

  async execute() {
    const sessionStorage = this.sessionStorageService.getSessionStorage();
    if (!sessionStorage) {
      return Actions.reply('Error, session storage not present');
    }
    const claimed = sessionStorage.get(CLAIMED_KEY);
    if (claimed) {
      return Actions.reply('This server has already been claimed.  Nice try');
    }
    const user = await this.userService.getCurrentUser();
    await this.rolesService.bindUserToBotRole(user.id, this.roleToGrant);
    sessionStorage.set(CLAIMED_KEY, true);
    return Actions.reply('You have claimed this bot and been granted the ' + this.roleToGrant + ' role!');
  }

}