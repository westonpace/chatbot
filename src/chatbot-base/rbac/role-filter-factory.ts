import { UserService } from './user-service';
import { Filter } from '../../chatbot/filter';

export class RoleFilterFactory {

  constructor(private userService: UserService) {

  }

  hasRole(role: string) {
    return <Filter> {
      allow: async () => {
        const user = await this.userService.getCurrentUser();
        return user.roles.indexOf(role) >= 0;
      }
    };
  }

}