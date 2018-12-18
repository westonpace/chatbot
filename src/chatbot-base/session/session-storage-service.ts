import { createNamespace } from 'cls-hooked';

export const sessionNamespace = createNamespace('session');
export const CONTEXT_KEY = 'context';
export type SessionStorage = Map<string, any>;

export class SessionStorageService<I> {

    private sessionContextMap = new Map<I, SessionStorage>();

    async wrapWithSessionStorage<T>(sessionId: I, body: () => Promise<T>) {
        let sessionStorage = this.sessionContextMap.get(sessionId);
        if (!sessionStorage) {
            sessionStorage = new Map<string, any>();
            this.sessionContextMap.set(sessionId, sessionStorage);
        }
        return sessionNamespace.runPromise(async () => {
            sessionNamespace.set(CONTEXT_KEY, sessionStorage);
            return body();
        });
    }

    getSessionStorage() {
        return sessionNamespace.get(CONTEXT_KEY) as Map<string, any>;
    }

}
