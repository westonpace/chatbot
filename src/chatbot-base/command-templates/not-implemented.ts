import { Command, NoParameters, ReplyAction, REPLY_ACTION } from '../../chatbot';

export const NOT_IMPLEMENTED_COMMAND = 'NOT_IMPLEMENTED_COMMAND';

export class NotImplemented implements Command<NoParameters> {

    alias = NOT_IMPLEMENTED_COMMAND;
    
    async execute() {
        return <ReplyAction> {
            type: REPLY_ACTION,
            messageToSend: 'This command has not yet been implemented'
        }
    }


}