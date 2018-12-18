import { Collection } from 'mongodb';

export interface RoleToRole {
  discordRole: string;
  botRole: string;
}

export interface UserToRole {
  userId: string;
  botRole: string;
}

export class RolesService {

  private set: Set<string>;
  private discordRoleToBotRoles = new Map<string, string[]>();
  private userIdsToBotRoles = new Map<string, string[]>();

  constructor(
    private roleToRolesCollection: Collection,
    private userToRolesCollection: Collection,
    ...roles: string[]) {
    this.set = new Set<string>(roles);
  }

  async initialize() {
    await this.initializeRoleToRole();
    await this.initializeUserToRole();
  }

  getAllRoles() {
    return this.set.values();
  }

  getRolesForDiscordUser(userId: string) {
    return this.userIdsToBotRoles.get(userId) || [];
  }
  
  getRolesForDiscordRole(roleName: string) {
    return this.discordRoleToBotRoles.get(roleName) || [];
  }

  private async initializeRoleToRole() {
    const discordRoleToBotRoles = (await this.roleToRolesCollection.find().toArray()) as RoleToRole[];
    for (const roleToRole of discordRoleToBotRoles) {
      let roles = this.discordRoleToBotRoles.get(roleToRole.discordRole);
      if (!roles) {
        roles = [];
        this.discordRoleToBotRoles.set(roleToRole.discordRole, roles);
      }
      roles.push(roleToRole.botRole);
    }
  }

  private async initializeUserToRole() {
    const userToRoles = (await this.userToRolesCollection.find().toArray()) as UserToRole[];
    for (const userToRole of userToRoles) {
      let roles = this.userIdsToBotRoles.get(userToRole.userId);
      if (!roles) {
        roles = [];
        this.userIdsToBotRoles.set(userToRole.userId, roles);
      }
      roles.push(userToRole.botRole);
    }
  }

  hasRole(role: string) {
    return this.set.has(role);
  }

  async bindDiscordRoleToBotRole(botRole: string, discordRole: string) {
    let existingRoles = this.discordRoleToBotRoles.get(discordRole);
    if (existingRoles && existingRoles.indexOf(botRole) >= 0) {
      return;
    }
    await this.roleToRolesCollection.insertOne({ discordRole, botRole });
    if (!existingRoles) {
      existingRoles = [];
      this.discordRoleToBotRoles.set(discordRole, existingRoles);
    }
    existingRoles.push(botRole);
  }

  async bindUserToBotRole(userId: string, botRole: string) {
    let existingRoles = this.userIdsToBotRoles.get(userId);
    if (existingRoles && existingRoles.indexOf(botRole) >= 0) {
      return;
    }
    await this.userToRolesCollection.insertOne({ userId, botRole });
    if (!existingRoles) {
      existingRoles = [];
      this.userIdsToBotRoles.set(userId, existingRoles);
    }
    existingRoles.push(botRole);
  }

}