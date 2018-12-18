import { ResponseAction } from './response-action';

export type NoParameters = {};

export interface Command<P> {
    alias?: string;
    execute(parameters: P, args: string[]): Promise<ResponseAction>;
}