import { Command, NoParameters, ReplyAction } from '../../chatbot';
import { SessionStorageService } from '../session';
import { TemporaryRoutingService } from '../routing';
import { AliasRedirectAction, REDIRECT_ACTION, CommandRedirectAction } from '../../chatbot/response-action';

export interface AliasMenuOption {
    name: string;
    description: string;
    commandAlias: string;
    parameters: any;
}

export interface CommandMenuOption<P> {
    name: string;
    description: string;
    command: Command<P>;
    parameters: P;
}

export type MenuOption = AliasMenuOption | CommandMenuOption<any>;

export function isAliasMenuOption(menuOption: MenuOption): menuOption is AliasMenuOption {
    return (menuOption as AliasMenuOption).commandAlias !== undefined;
}

const MENU_BREADCRUMBS_KEY = 'menu-breadcrumbs';

export class PrintMenuAction implements ReplyAction {

    type: 'reply' = 'reply';

    constructor (public breadcrumbs: string[], public options: MenuOption[]) {

    }

    get messageToSend() {
        return this.breadcrumbs.join(' > ') + '\n\n' +
        'What would you like to do?\n\n' +
        this.options.map(option => {
            return option.name + ' - ' + option.description;
        }).join('\n');
    }

}

export class Menu implements Command<NoParameters> {

    public alias?: string;

    constructor(
        private name: string,
        private options: MenuOption[],
        private sessionContext: SessionStorageService<any>,
        private temporaryRouteService: TemporaryRoutingService
        ) {

    }

    private updateBreadcrumbs() {
        const session = this.sessionContext.getSessionStorage();
        const breadcrumbs = (session.get(MENU_BREADCRUMBS_KEY) || []) as string[];
        breadcrumbs.push(this.name);
        session.set(MENU_BREADCRUMBS_KEY, breadcrumbs);
        return breadcrumbs;
    }

    private addRoutes() {
        for (const option of this.options) {
            if (isAliasMenuOption(option)) {
                const redirect: AliasRedirectAction = {
                    type: REDIRECT_ACTION,
                    alias: option.commandAlias,
                    parameters: option.parameters,
                    args: []
                };
                this.temporaryRouteService.addTemporaryRoute(redirect, option.name);
            } else if (option.command) {
                const redirect: CommandRedirectAction = {
                    type: REDIRECT_ACTION,
                    command: option.command,
                    parameters: option.parameters,
                    args: []
                };
                this.temporaryRouteService.addTemporaryRoute(redirect, option.name);
            } else {
                throw new Error('A menu option must have a commandAlias or a command');
            }
        }
    }

    async execute() {
        const breadcrumbs = this.updateBreadcrumbs();
        this.addRoutes();
        return new PrintMenuAction(breadcrumbs, this.options);
    }

}

export class MenuBuilder {

    private submenuToName = new Map<any, { optionName: string; optionDescription: string }>();
    private options: MenuOption[] = [];
    private _alias?: string;

    constructor(
        private sessionContext: SessionStorageService<any>,
        private temporaryRoutingService: TemporaryRoutingService,
        private name: string,
        private parent?: MenuBuilder
    ) {

    }

    command<P>(name: string, description: string, command: Command<P>, parameters: P = {} as any) {
        this.options.push({
            name, description, command, parameters
        });
        return this;
    }

    commandAlias(name: string, description: string, commandAlias: string, parameters = {}) {
        this.options.push({
            name, description, commandAlias, parameters
        });
        return this;
    }

    alias(value: string) {
        this._alias = value;
        return this;
    }

    private addSubmenu(submenu: Menu, submenuBuilder: MenuBuilder) {
        const optionDescriptor = this.submenuToName.get(submenuBuilder)!;
        this.options.push({
            name: optionDescriptor.optionName,
            description: optionDescriptor.optionDescription,
            command: submenu,
            parameters: {}
        });
    }

    private buildResult() {
        const result = new Menu(this.name, this.options, this.sessionContext, this.temporaryRoutingService);
        if (this._alias) {
            result.alias = this._alias;
        }
        return result;
    }

    buildSubmenu() {
        if (this.options.length === 0) {
            throw new Error('Need to add at least one option to a submenu');
        }
        if (!this.parent) {
            throw new Error('I think you meant `build()`?');
        }
        const result = this.buildResult();
        this.parent.addSubmenu(result, this);
        return this.parent;
    }

    build() {
        if (this.options.length === 0) {
            throw new Error('Need to add at least one option to a menu');
        }
        const result = this.buildResult();
        if (this.parent) {
            throw new Error('I think you meant `buildSubmenu()`?');
        } else {
            return result;
        }
    }

    submenu(optionName: string, optionDescription: string, menuName: string) {
        const submenu = new MenuBuilder(
            this.sessionContext,
            this.temporaryRoutingService,
            menuName,
            this
        );
        this.submenuToName.set(submenu, { optionName, optionDescription });
        return submenu;
    }

}

export class MenuBuilderFactory {

    constructor(private sessionContext: SessionStorageService<any>, private temporaryRoutingService: TemporaryRoutingService) {

    }

    createMenuBuilder(name: string) {
        return new MenuBuilder(this.sessionContext, this.temporaryRoutingService, name);
    }

}