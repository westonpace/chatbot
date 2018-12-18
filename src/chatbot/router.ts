interface Route<T> {
  path: RouteMatcher[];
  value: T;
}

export interface FoundRoute<T> {
  value: T;
  path: string;
}

class RouteParameters {
  parameters: { [key: string]: string } = {};
  args: string[] = [];
}

interface RouteMatcher {
  matches(routePart: string): boolean;
  apply(routePart: string, context: RouteParameters): void;
  stringDescription(): string;
}

class ParamMatcher implements RouteMatcher {

  constructor(private paramName: string) { }

  matches() { return true; }
  apply(routePart: string, context: RouteParameters) {
    context.parameters[this.paramName] = routePart;
  }
  stringDescription() {
    return `[${this.paramName}]`;
  }
}

class LiteralMatcher implements RouteMatcher {

  private literal: string;

  constructor(literalMixedCase: string) {
    this.literal = literalMixedCase.toLowerCase();
  }

  matches(pathPart: string) {
    return pathPart.toLowerCase() === this.literal;
  }
  apply() { }
  stringDescription() {
    return this.literal;
  }
}

export interface RoutingResult<T> {
  value: T;
  parameters: { [key: string]: string };
  args: string[];
}

export class Router<T> {

  private childRouters: Router<T>[] = [];
  private routes: Route<T>[] = [];

  getRoute(path: string): RoutingResult<T> | undefined {
    const result = this.getRouteFromRoutes(path);
    if (result) {
      return result;
    }
    return this.getRouteFromChildRouters(path);
  }

  clear() {
    this.routes = [];
    this.childRouters = [];
  }

  getRoutesStartingWith(path: string | null) {
    let myRoutes: FoundRoute<T>[];
    if (path === null) {
      myRoutes = this.routes.map(route => this.makeFoundRoute(route));
    } else {
      myRoutes = this.getAllRoutesByPrefix(path);
    }
    let allRoutes = myRoutes;
    for (const childRouter of this.childRouters) {
      allRoutes = allRoutes.concat(childRouter.getRoutesStartingWith(path));
    }
    return allRoutes;
  }

  private getRouteFromChildRouters(path: string) {
    for (const childRouter of this.childRouters) {
      const possibleResult = childRouter.getRoute(path);
      if (possibleResult) {
        return possibleResult;
      }
    }
    return undefined;
  }

  private getAllRoutesByPrefix(path: string) {
    const messageParts = path.split(/\s+/g);
    return this.routes
      .filter(route => this.routeMatches(route, messageParts))
      .map(route => this.makeFoundRoute(route));
  }

  private makeFoundRoute(route: Route<T>): FoundRoute<T> {
    return {
      value: route.value,
      path: route.path.map(matcher => matcher.stringDescription()).join(' ')
    };
  }

  private getRouteFromRoutes(path: string) {
    const messageParts = path.split(/\s+/g);
    const route = this.routes
      .filter(route => route.path.length <= messageParts.length)
      .find(route => this.routeMatches(route, messageParts));
    if (route) {
      const result: RoutingResult<T> = {
        value: route.value,
        parameters: {},
        args: messageParts.slice(route.path.length)
      };
      route.path.forEach((matcher, i) => matcher.apply(messageParts[i], result));
      return result;
    }
    return undefined;
  }

  private routeMatches(route: Route<T>, messageParts: string[]) {
    const numItems = Math.min(route.path.length, messageParts.length);
    for (let i = 0; i < numItems; i++) {
      if (!route.path[i].matches(messageParts[i])) {
        return false;
      }
    }
    return true;
  }

  private createMatcher(pathPart: string) {
    if (pathPart.startsWith(':')) {
      return new ParamMatcher(pathPart.substr(1));
    } else {
      return new LiteralMatcher(pathPart);
    }
  }

  addRoute(route: string[], value: T) {
    this.routes.push({
      path: route.map(pathPart => this.createMatcher(pathPart)),
      value
    });
  }

  addChildRouter(router: Router<T>) {
    this.childRouters.push(router);
  }

}