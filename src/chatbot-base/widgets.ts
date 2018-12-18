import { Chatbot } from '../chatbot/chatbot';
import { SessionMiddleware, SessionStorageService } from './session';
import { TemporaryRoutingService, TemporaryRoutingMiddleware } from './routing';
import { MenuBuilderFactory } from './command-templates';
import { PrefixService } from './prefix/prefix-service';
import { PersistentConfigService } from './persistent-config-service';
import { PrefixMiddleware } from './prefix/prefix-middleware';
import { SessionIdService } from './session/session-id-service';

export class WidgetsModule {

    sessionStorageService: SessionStorageService<any>;
    temporaryRoutingService: TemporaryRoutingService;
    prefixService: PrefixService;
    menuBuilderFactory: MenuBuilderFactory;

    constructor(
      private sessionIdService: SessionIdService<any>,
      private persistentConfigService: PersistentConfigService,
      defaultPrefix: string
      ) {
        this.sessionStorageService = new SessionStorageService();
        this.prefixService = new PrefixService(this.persistentConfigService, defaultPrefix);
        this.temporaryRoutingService = new TemporaryRoutingService(this.sessionStorageService);
        this.menuBuilderFactory = new MenuBuilderFactory(this.sessionStorageService, this.temporaryRoutingService);
    }

    apply(chatbot: Chatbot) {
      chatbot.usePreRouting(new PrefixMiddleware(this.prefixService));
      chatbot.usePreRouting(new SessionMiddleware(this.sessionIdService, this.sessionStorageService));
      chatbot.usePreRouting(new TemporaryRoutingMiddleware(this.temporaryRoutingService));
    }

}