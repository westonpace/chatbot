import { Router } from '../../chatbot/router';
import { RedirectAction } from '../../chatbot/response-action';
import { SessionStorageService } from '../session';

export const TEMPORARY_ROUTING_ROUTER_SESSION_KEY = 'base:temp-routing:router';
export const TEMPORARY_ROUTING_HAVE_ADDED_ROUTES_KEY = 'base:temp-routing:have-added-routes';

export class TemporaryRoutingService {

    constructor(private sessionStorageService: SessionStorageService<any>) {

    }

    tryGetTemporaryRoute(message: string) {
        const router = this.getTemporaryRouterForSession();
        const result = router.getRoute(message);
        if (result) {
            return result.value;
        } else {
            return result;
        }
    }

    addTemporaryRoute(action: RedirectAction, ...route: string[]) {
        this.clearTemporaryRoutes();
        const router = this.getTemporaryRouterForSession();
        router.addRoute(route, action);
        const sessionStorage = this.sessionStorageService.getSessionStorage();
        sessionStorage.set(TEMPORARY_ROUTING_HAVE_ADDED_ROUTES_KEY, true);
    }

    clearTemporaryRoutes() {
        if (!this.haveAddedRoutes()) {
            const router = this.getTemporaryRouterForSession();
            router.clear();
        }
    }

    startRequest() {
        const sessionStorage = this.sessionStorageService.getSessionStorage();
        sessionStorage.set(TEMPORARY_ROUTING_HAVE_ADDED_ROUTES_KEY, false);
    }
    
    private haveAddedRoutes() {
        const sessionStorage = this.sessionStorageService.getSessionStorage();
        return sessionStorage.get(TEMPORARY_ROUTING_HAVE_ADDED_ROUTES_KEY) as boolean || false;
    }

    private getTemporaryRouterForSession() {
        const sessionStorage = this.sessionStorageService.getSessionStorage();
        let router = sessionStorage.get(TEMPORARY_ROUTING_ROUTER_SESSION_KEY) as Router<RedirectAction>;
        if (!router) {
            router = new Router<RedirectAction>();
            sessionStorage.set(TEMPORARY_ROUTING_ROUTER_SESSION_KEY, router);
        }
        return router;
    }

}