import { ResponseAction, NO_MATCH_ACTION, PreRoutingNextFunction, PreRoutingMiddleware } from '../../chatbot';

import { TemporaryRoutingService } from './temporary-routing-service';

export class TemporaryRoutingMiddleware implements PreRoutingMiddleware {

    constructor(private temporaryRoutingService: TemporaryRoutingService) {
        
    }

    async apply(message: string | null, next: PreRoutingNextFunction): Promise<ResponseAction> {
        this.temporaryRoutingService.startRequest();
        const possibleRedirect = (message === null) ? null : this.temporaryRoutingService.tryGetTemporaryRoute(message);
        if (possibleRedirect) {
            this.temporaryRoutingService.clearTemporaryRoutes();
            return possibleRedirect;
        } else {
            const response = await next(message);
            if (response.type !== NO_MATCH_ACTION) {
                this.temporaryRoutingService.clearTemporaryRoutes();
            }
            return response;
        }
    }

}