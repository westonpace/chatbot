import { Command } from './command';

export interface ResponseAction {
    type: string;
}

export const REPLY_ACTION = 'reply';
export interface ReplyAction extends ResponseAction {
    type: 'reply';
    messageToSend: string;
}
export function isReply(action: ResponseAction): action is ReplyAction {
    return action.type === REPLY_ACTION;
}

export const NO_MATCH_ACTION = 'no-match';
export interface NoMatchAction extends ResponseAction {
    type: 'no-match';
}

export const REDIRECT_ACTION = 'redirect';
export interface BaseRedirectAction extends ResponseAction {
    type: 'redirect';
    alias?: string;
    parameters?: any;
    args?: string[];
}

export interface CommandRedirectAction extends BaseRedirectAction {
    command: Command<any>;
}

export interface AliasRedirectAction extends BaseRedirectAction {
    alias: string;
}

export type RedirectAction = AliasRedirectAction | CommandRedirectAction;

export function isRedirect(action: ResponseAction): action is RedirectAction {
    return action.type === REDIRECT_ACTION;
}

export function isCommandRedirect(action: RedirectAction): action is CommandRedirectAction {
    return !!(action as CommandRedirectAction).command;
}

export function isAliasRedirect(action: RedirectAction): action is AliasRedirectAction {
    return !!(action as AliasRedirectAction).alias;
}

export const ERROR_ACTION = 'error';
export interface ErrorAction extends ResponseAction {
    type: 'error';
    err: any;
}
export function isError(action: ResponseAction): action is ErrorAction {
    return action.type === ERROR_ACTION;
}

export interface ResponseHandler {
    handleResponse(responseAction: ResponseAction): Promise<any>;
}