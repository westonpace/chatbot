import { ResponseAction } from './response-action';

export type NextFunction = (parameters: any, args: string[]) => Promise<ResponseAction>;

export interface Middleware {
    apply(parameters: any, args: string[], next: NextFunction): Promise<ResponseAction>;
}

export type PreRoutingNextFunction = (message: string | null) => Promise<ResponseAction>;

export interface PreRoutingMiddleware {
    apply(message: string | null, next: PreRoutingNextFunction): Promise<ResponseAction>;
}