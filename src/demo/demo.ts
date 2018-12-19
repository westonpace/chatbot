import { MongoClient } from 'mongodb';
import { DiscordChatbotErrorHandler, DiscordChatbot, RolesService, DiscordUserService, BindRoleToRoleCommand, AvailableRolesCommand } from '../discord';
import { Chatbot } from '../chatbot';
import { MongoPersistentConfigService, WidgetsModule, RoleFilterFactory, WhoAmICommand, PrintHelpCommand, ClaimCommand, SetPrefixCommand } from '../chatbot-base';
import config from 'config';

export interface DemoConfig {
    discordSecret: string;
}

const ADMIN_ROLE = 'admin';
const ROLES = [
    ADMIN_ROLE
];

export class DemoBot implements DiscordChatbotErrorHandler {

    private discordBot: DiscordChatbot | null = null;

    constructor(private config: DemoConfig) {

    }

    async start() {
        const mongoClient = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        const db = mongoClient.db('sokets');
        const chatbot = new Chatbot();
        this.discordBot = new DiscordChatbot(chatbot, this.config.discordSecret, this);

        const persistentConfigService = new MongoPersistentConfigService(db.collection('config'));
        await persistentConfigService.initialize();
        const rolesService = new RolesService(db.collection('role-mappings'), db.collection('user-mappings'), ...ROLES);
        await rolesService.initialize();
        const widgets = new WidgetsModule(this.discordBot.discordContext, persistentConfigService, '!');
        const userService = new DiscordUserService(rolesService, this.discordBot.discordContext, widgets.sessionStorageService);
        const roles = new RoleFilterFactory(userService);

        widgets.apply(chatbot);
        chatbot.addRoute(new WhoAmICommand(userService), 'whoami');
        chatbot.addRoute(new PrintHelpCommand(chatbot), 'help');
        chatbot.addRoute(new ClaimCommand(rolesService, userService, persistentConfigService, ADMIN_ROLE), 'bot', 'claim');
        chatbot.addRoute(new BindRoleToRoleCommand(rolesService), 'bot', 'bind-role', ':discordRole', ':botRole').addFilter(roles.hasRole(ADMIN_ROLE));
        chatbot.addRoute(new AvailableRolesCommand(rolesService), 'bot', 'show-roles').addFilter(roles.hasRole(ADMIN_ROLE));
        chatbot.addRoute(new SetPrefixCommand(widgets.prefixService), 'bot', 'prefix', ':prefix').addFilter(roles.hasRole(ADMIN_ROLE));

        return this.discordBot.initialize();
    }

    async stop() {
        if (this.discordBot) {
            return this.discordBot.stop();
        }
    }

    onError(err: any) {
        console.log('An error occurred processing a message');
        console.log(err);
    }
}

const demoConfig = config.get('bot') as any;

const bot = new DemoBot(demoConfig);
bot.start().then(() => {
    console.log('Bot is running');
});
