import { SessionMiddleware, SessionStorageService } from '../../chatbot-base/session';
import { TemporaryRoutingMiddleware } from '../../chatbot-base/routing/temporary-routing-middleware';
import { TemporaryRoutingService } from '../../chatbot-base/routing/temporary-routing-service';
import { Chatbot, Command, ReplyAction, REPLY_ACTION, NO_MATCH_ACTION, RedirectAction, REDIRECT_ACTION } from '../../chatbot';
import { SessionIdService } from '../../chatbot-base/session/session-id-service';

describe('Base chatbot middleware test', () => {

    let printNameCommand: Command<{name: string}> = {
        alias: 'print-name',
        execute: async (parameters: {name: string}) => {
            return <ReplyAction> {
                messageToSend: parameters.name || 'unknown',
                type: REPLY_ACTION
            };
        }
    }

    let redirectToName: RedirectAction = {
        type: REDIRECT_ACTION,
        alias: 'print-name',
        parameters: {}
    }

    let mockRequestId = '1';
    let mockSessionIdService: SessionIdService<string> = {
        getSessionId: () => mockRequestId
    }
    let sessionMiddleware: SessionMiddleware<string>;
    let temporaryRoutingMiddleware: TemporaryRoutingMiddleware;
    let sessionService: SessionStorageService<string>;
    let temporaryRoutingService: TemporaryRoutingService;
    let chatbot: Chatbot;

    beforeEach(() => {
        sessionService = new SessionStorageService();
        sessionMiddleware = new SessionMiddleware<string>(mockSessionIdService, sessionService);
        temporaryRoutingService = new TemporaryRoutingService(sessionService);
        temporaryRoutingMiddleware = new TemporaryRoutingMiddleware(temporaryRoutingService);
        chatbot = new Chatbot();
        chatbot.usePreRouting(sessionMiddleware);
        chatbot.usePreRouting(temporaryRoutingMiddleware);
    });

    it('Should allow for tempoarary routing', async () => {
        chatbot.addRoute(printNameCommand, 'hello');
        let response = await chatbot.onMessage('next');
        // Initially, no temporary route so no match
        expect(response.type).toBe(NO_MATCH_ACTION);

        await sessionMiddleware.apply('', async () => {
            // Have to add the temporary route inside of a session because the
            // temporary routers are session based
            temporaryRoutingService.addTemporaryRoute(redirectToName, 'next');
            return null!;
        });
        response = await chatbot.onMessage('next');
        // Add temporary route get match
        expect(response.type).toBe(REPLY_ACTION);

        // Try again fail because temp routes cleared
        response = await chatbot.onMessage('next');
        expect(response.type).toBe(NO_MATCH_ACTION);

        await sessionMiddleware.apply('', async () => {
            temporaryRoutingService.addTemporaryRoute(redirectToName, 'next');
            return null!;
        });
        await chatbot.onMessage('hello');
        response = await chatbot.onMessage('next');
        // Normal commands also clear temporary routes
        expect(response.type).toBe(NO_MATCH_ACTION);
    });

});
