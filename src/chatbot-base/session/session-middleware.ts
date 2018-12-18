import { PreRoutingMiddleware, PreRoutingNextFunction } from '../../chatbot';

import { SessionStorageService } from './session-storage-service';
import { SessionIdService } from './session-id-service';

export class SessionMiddleware<I> implements PreRoutingMiddleware {

    constructor(private requestIdService: SessionIdService<I>, private sessionService: SessionStorageService<I>) {

    }

    async apply(message: string, next: PreRoutingNextFunction) {
        const requestId = await this.requestIdService.getSessionId();
        return this.sessionService.wrapWithSessionStorage(requestId, () => next(message));        
    }

}
