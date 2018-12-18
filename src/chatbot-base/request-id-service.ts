export interface RequestIdService<I> {
    getRequestId(): Promise<I>;
}