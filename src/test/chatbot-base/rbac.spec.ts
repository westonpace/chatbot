import { DbTestFixture, prepareDbTest } from "../util/db-test";
import { RolesService, UserToRole, RoleToRole } from "../../discord";
import { Collection } from "mongodb";

const ADMIN_ROLE = 'admin';
const ROLES: string[] = [ADMIN_ROLE];

fdescribe('Role based access control tests', () => {

  let dbTestFixture: DbTestFixture;
  let roleService: RolesService;
  let userMappings: Collection<UserToRole>;
  let roleMappings: Collection<RoleToRole>;

  beforeAll(async () => {
    dbTestFixture = await prepareDbTest();
    userMappings = dbTestFixture.getCollection('user-mappings');
    roleMappings = dbTestFixture.getCollection('role-mappings');
    roleService = new RolesService(roleMappings, userMappings, ...ROLES);
  });

  afterAll(() => {
    dbTestFixture.cleanup();
  });

  it('Should only persist the role once', async () => {
    await roleService.bindUserToBotRole('123', ADMIN_ROLE);
    await roleService.bindUserToBotRole('123', ADMIN_ROLE);
    expect(await userMappings.count()).toBe(1);
    const userMapping = await userMappings.findOne({});
    if (userMapping) {
      expect(userMapping.botRole).toBe(ADMIN_ROLE);
      expect(userMapping.userId).toBe('123');
    }
  });

  it('Should persist a role binding once', async () => {
    await roleService.bindDiscordRoleToBotRole(ADMIN_ROLE, 'admins');
    await roleService.bindDiscordRoleToBotRole(ADMIN_ROLE, 'admins');
    expect(await roleMappings.count()).toBe(1);
    const roleMapping = await roleMappings.findOne({});
    if (roleMapping) {
      expect(roleMapping.botRole).toBe(ADMIN_ROLE);
      expect(roleMapping.discordRole).toBe('admins');
    }
  });

  it('Should initialize correctly', async () => {
    roleService = new RolesService(roleMappings, userMappings, ...ROLES);
    await roleService.initialize();
    expect(await roleService.getRolesForDiscordRole('admins')).toEqual([ADMIN_ROLE]);
    expect(await roleService.getRolesForDiscordUser('123')).toEqual([ADMIN_ROLE]);
    await roleService.bindDiscordRoleToBotRole(ADMIN_ROLE, 'admins');
    await roleService.bindUserToBotRole('123', ADMIN_ROLE);
    expect(await roleMappings.count()).toBe(1);
    expect(await userMappings.count()).toBe(1);
    
  });

});