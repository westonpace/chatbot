import { UserService, User, SessionStorageService } from '../../chatbot-base';
import { RolesService } from './roles-service';
import { DiscordContext } from '../context';

export const DISCORD_USER_SERVICE_USER_KEY = 'DISCORD_USER_SERVICE_USER_KEY';

export class DiscordUserService implements UserService{

  constructor(
    private rolesService: RolesService,
    private discordContext: DiscordContext,
    private sessionStorage: SessionStorageService<any>
    ) {

  }

  async getCurrentUser(): Promise<User> {
    const sessionStorage = this.sessionStorage.getSessionStorage();
    const cachedUser = sessionStorage.get(DISCORD_USER_SERVICE_USER_KEY);
    if (cachedUser) {
      return cachedUser;
    }
    const discordUser = this.discordContext.getCurrentUser();
    let allRoles = this.rolesService.getRolesForDiscordUser(discordUser.id);
    const member = this.discordContext.getCurrentMember();
    for (const role of member.roles.values()) {
      allRoles = allRoles.concat(this.rolesService.getRolesForDiscordRole(role.name));
    }
    const result: User = {
      id: discordUser.id,
      roles: allRoles
    };
    sessionStorage.set(DISCORD_USER_SERVICE_USER_KEY, result);
    return result;
  }
  
}