import { Command, Chatbot, ReplyAction, REPLY_ACTION, isReply, Middleware, NextFunction,
    NoParameters, RedirectAction, REDIRECT_ACTION, ResponseAction, NO_MATCH_ACTION } from '../../chatbot';
import { Filter } from '../../chatbot/filter';

describe('Chatbot tests', () => {

    let chatbot: Chatbot;
    let printNameCommand: Command<{name: string}> = {
        alias: 'print-name',
        execute: async (parameters: {name: string}) => {
            return <ReplyAction> {
                messageToSend: parameters.name || 'unknown',
                type: REPLY_ACTION
            };
        }
    }
    let printArgsCommand: Command<NoParameters> = {
        alias: 'print-args',
        execute: async (_: NoParameters, args: string[]) => {
            return <ReplyAction> {
                messageToSend: args.join(', '),
                type: REPLY_ACTION
            };
        }
    }
    let redirectCommand: Command<NoParameters> = {
        alias: 'redirect',
        execute: async () => {
            return <RedirectAction> {
                alias: 'print-name',
                parameters: { name: 'redirected' },
                type: REDIRECT_ACTION
            };
        }
    }

    beforeEach(() => {
        chatbot = new Chatbot();
    });

    function validateReplyResponse(response: ResponseAction | undefined, expectedMessage: string) {
        expect(response).toBeDefined();
        if (response) {
            expect(isReply(response)).toBe(true);
            if (isReply(response)) {
                expect(response.messageToSend).toBe(expectedMessage);
            }
        }
    }

    describe('Chatbot filter tests', () => {

      let shouldAllow: boolean;

      beforeEach(() => {
        shouldAllow = false;
        let filter: Filter = {
          allow: async () => shouldAllow
        };
        chatbot.addRoute(printNameCommand, 'test').addFilter(filter);
      });

      it('Should block a command if a filter is in place', async() => {
        let result = await chatbot.onMessage('test');
        expect(result.type).toBe(NO_MATCH_ACTION);

        shouldAllow = true;
        result = await chatbot.onMessage('test');
        expect(result.type).toBe(REPLY_ACTION);
      });

    });

    describe('Chatbot tests requiring a command', () => {

        beforeEach(() => {
            chatbot.addRoute(printNameCommand, 'hello');
            chatbot.addRoute(printNameCommand, 'hi', ':name');
            chatbot.addRoute(printArgsCommand, 'argh')
            chatbot.addRoute(redirectCommand, 'loop');
        });

        it('Should execute the command', async () => {
            const responseAction = await chatbot.onMessage('hello');
            validateReplyResponse(responseAction, 'unknown');
        });

        it('Should allow me to apply middleware', async () => {

            const middleware: Middleware = {
                apply: async (parameters: any, args: string[], next: NextFunction) => {
                    parameters.name = 'intercepted';
                    return next(parameters, args);
                }
            }

            chatbot.use(middleware);

            const responseAction = await chatbot.onMessage('hello');
            validateReplyResponse(responseAction, 'intercepted');
        });

        it('Should pass parameters', async () => {
            let responseAction = await chatbot.onMessage('hello bob');
            validateReplyResponse(responseAction, 'unknown');
            responseAction = await chatbot.onMessage('hi bob');
            validateReplyResponse(responseAction, 'bob');
        });

        it('Should add args if there are unprocessed bits', async () => {
            let responseAction = await chatbot.onMessage('argh me matey');
            validateReplyResponse(responseAction, 'me, matey');
        });

        it('Should redirect', async () => {
            let responseAction = await chatbot.onMessage('loop');
            validateReplyResponse(responseAction, 'redirected');
        })
        
    });

});
