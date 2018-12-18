import { PreRoutingMiddleware, PreRoutingNextFunction, Actions, ResponseAction } from '../../chatbot';
import { PrefixService } from './prefix-service';

export class PrefixMiddleware implements PreRoutingMiddleware {

  constructor(private prefixService: PrefixService) {

  }

  async apply(message: string | null, next: PreRoutingNextFunction): Promise<ResponseAction> {
    const prefix = await this.prefixService.getPrefix();
    if (message) {
      const indexOfPrefix = message.indexOf(prefix);
      if (indexOfPrefix >= 0) {
        const remainder = message.substr(indexOfPrefix + prefix.length).trimLeft();
        return next(remainder);
      } else {
        return Actions.noMatch();
      }
    } else {
      return next(message);
    }
  }

}