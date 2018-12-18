import { Router, RoutingResult } from '../../chatbot/router';

describe('Router tests', () => {

  let router: Router<string>;

  beforeEach(() => {
    router = new Router<string>();
  });

  function validateRouteResponse(routeResponse: RoutingResult<string> | undefined, expectedValue: string, expectedArgs?: string[], expectedParameters?: any) {
    expect(routeResponse).toBeDefined();
    if (routeResponse) {
      expect(routeResponse.value).toBe(expectedValue);
      if (expectedArgs) {
        expect(routeResponse.args).toEqual(expectedArgs);
      }
      if (expectedParameters) {
        expect(routeResponse.parameters).toEqual(expectedParameters);
      }
    }
  }

  it('Should allow me to add a route and then and route to a route', () => {
    router.addRoute(['hello', 'world'], 'abc');
    const routeResponse = router.getRoute('hello world');
    validateRouteResponse(routeResponse, 'abc', [], {});
  });

  it('Should return undefined if no route exists', () => {
    expect(router.getRoute('hello world')).toBeUndefined();
  });

  it('Should populate parameters', () => {
    router.addRoute(['hello', ':name'], 'abc');
    const routeResponse = router.getRoute('hello Bob');
    validateRouteResponse(routeResponse, 'abc', [], { name: 'Bob' });
  });

  it('Should populate args with excess fields', () => {
    router.addRoute(['hello'], 'abc');
    const routeResponse = router.getRoute('hello arg1   aRg2');
    validateRouteResponse(routeResponse, 'abc', ['arg1', 'aRg2'], {});
  });

  it('Should give preference to the first match', () => {
    router.addRoute(['hello'], 'abc');
    router.addRoute(['hello world'], 'def');
    const routeResponse = router.getRoute('hello world');
    validateRouteResponse(routeResponse, 'abc');
  });

  it('Should list routes', () => {
    router.addRoute(['hello'], 'abc');
    router.addRoute(['hello', ':world'], 'def');
    router.addRoute(['blah', 'de', 'blah'], 'hij');
    const routes = router.getRoutesStartingWith(null);
    expect(routes.length).toBe(3);
    if (routes.length === 3) {
      expect(routes[0].path).toBe('hello');
      expect(routes[0].value).toBe('abc');
      expect(routes[1].path).toBe('hello [world]');
      expect(routes[1].value).toBe('def');
      expect(routes[2].path).toBe('blah de blah');
      expect(routes[2].value).toBe('hij');
    }
  });

  it('Should filter routes', () => {
    router.addRoute(['hello'], 'abc');
    router.addRoute(['hello', ':world'], 'def');
    router.addRoute(['blah', 'de', 'blah'], 'hij');
    const routes = router.getRoutesStartingWith('hello');
    expect(routes.length).toBe(2);
    if (routes.length === 2) {
      expect(routes[0].path).toBe('hello');
      expect(routes[0].value).toBe('abc');
      expect(routes[1].path).toBe('hello [world]');
      expect(routes[1].value).toBe('def');
    }
  });

  describe('Child router tests', () => {
    let childRouter: Router<string>;

    beforeEach(() => {
      childRouter = new Router<string>();
      router.addChildRouter(childRouter);
    });

    it('Should fall back to any child routers', () => {
      childRouter.addRoute(['hello'], 'abc');
      const response = router.getRoute('hello');
      validateRouteResponse(response, 'abc');
    });

    it('Should give preference to parent routers', () => {
      router.addRoute(['hello'], 'abc');
      childRouter.addRoute(['hello'], 'def');
      const response = router.getRoute('hello');
      validateRouteResponse(response, 'abc');
    });
  });

});
