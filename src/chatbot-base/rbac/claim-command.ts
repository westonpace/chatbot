import { NoParameters, Command } from '../../chatbot/command';
import { RolesService } from '../../discord';
import { UserService } from './user-service';
import { Actions } from '../../chatbot/actions';
import { PersistentConfigService } from '../persistent-config-service';

const CLAIMED_KEY = 'CLAIMED_KEY';

export class ClaimCommand implements Command<NoParameters> {

  constructor(
    private rolesService: RolesService,
    private userService: UserService,
    private configService: PersistentConfigService,
    private roleToGrant: string
    ) {

  }

  async execute() {
    const claimed = await this.configService.load(CLAIMED_KEY);
    if (claimed) {
      return Actions.reply('This server has already been claimed.  Nice try');
    }
    const user = await this.userService.getCurrentUser();
    await this.rolesService.bindUserToBotRole(user.id, this.roleToGrant);
    await this.configService.save(CLAIMED_KEY, true);
    return Actions.reply('You have claimed this bot and been granted the ' + this.roleToGrant + ' role!');
  }

}