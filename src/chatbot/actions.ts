import { ReplyAction, REPLY_ACTION, NO_MATCH_ACTION, NoMatchAction } from './response-action';

export class Actions {

  static reply(messageToSend: string) {
    return <ReplyAction> {
      messageToSend,
      type: REPLY_ACTION
    };
  }

  static noMatch() {
    return <NoMatchAction> {
      type: NO_MATCH_ACTION
    };
  }

}