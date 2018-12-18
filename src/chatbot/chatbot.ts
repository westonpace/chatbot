import { Middleware, PreRoutingMiddleware } from './middleware';
import { Command } from './command';
import { Router } from './router';
import { ResponseAction, isRedirect, RedirectAction, ErrorAction, isAliasRedirect, isCommandRedirect, AliasRedirectAction, CommandRedirectAction } from './response-action';
import { Actions } from './actions';
import { Filter } from './filter';

interface ExecutionParameters {
  command: Command<any>
  parameters: any;
  args: string[];
}

interface CommandRecord {
  command: Command<any>;
  filters: Filter[];
  middleware: Middleware[];
}

export class CommandRouteBuilder {

  constructor(private record: CommandRecord) {

  }

  addFilter(filter: Filter) {
    this.record.filters.push(filter);
  }

  use(middleware: Middleware) {
    this.record.middleware.push(middleware);
  }

}

export class Chatbot {

  private preRoutingMiddleware: PreRoutingMiddleware[] = [];
  private middleware: Middleware[] = [];
  private router = new Router<CommandRecord>();
  private commands = new Map<string, Command<any>>();

  constructor() {

  }

  use(middleware: Middleware) {
    this.middleware.push(middleware);
  }

  usePreRouting(preRoutingMiddleware: PreRoutingMiddleware) {
    this.preRoutingMiddleware.push(preRoutingMiddleware);
  }

  async onMessage(message: string) {
    const result = await this.handleMessage(message, 0);
    if (isRedirect(result)) {
      return this.handleRedirect(result);
    } else {
      return result;
    }
  }

  async getCommandsStartingWith(message: string | null) {
    const routes = this.router.getRoutesStartingWith(message);
    const matchingRoutes = [];
    for (const route of routes) {
      const executionParams: ExecutionParameters = {
        args: [],
        command: route.value.command,
        parameters: {}
      };
      const filterResult = await this.passesFilters(executionParams, route.value.filters);
      if (filterResult) {
        matchingRoutes.push(route);
      }
    }
    return matchingRoutes;
  }

  addRoute(command: Command<any>, ...pathParts: string[]) {
    if (pathParts.length === 0) {
      throw new Error('Must have at least one part part');
    }
    const commandRecord: CommandRecord = {
      command,
      filters: [],
      middleware: []
    }
    if (command.alias) {
      this.commands.set(command.alias, command);
    }
    this.router.addRoute(pathParts, commandRecord);
    return new CommandRouteBuilder(commandRecord);
  }

  private async handleMessage(message: string | null, index: number): Promise<ResponseAction> {
    if (index === this.preRoutingMiddleware.length) {
      return this.doHandleMessage(message);
    }
    const middleware = this.preRoutingMiddleware[index];
    const next = (newMessage: string | null) => this.handleMessage(newMessage, index + 1);
    return middleware.apply(message, next);
  }

  private async doHandleMessage(message: string | null) {
    if (message === null) {
      return Actions.noMatch();
    }
    const routerResult = this.router.getRoute(message);
    if (routerResult) {
      const executionParams: ExecutionParameters = {
        command: routerResult.value.command,
        parameters: routerResult.parameters,
        args: routerResult.args
      }
      if (!(await this.passesFilters(executionParams, routerResult.value.filters))) {
        return Actions.noMatch();
      }
      return this.executeCommandWithMiddleware(executionParams, routerResult.value.middleware);
    }
    return Actions.noMatch();
  }

  private async passesFilters(executionParams: ExecutionParameters, filters: Filter[]) {
    for (const filter of filters) {
      const filterResult = await filter.allow(executionParams.command, executionParams.parameters, executionParams.args);
      if (!filterResult) {
        return false;
      }
    }
    return true;
  }

  private async handleAliasRedirect(redirectAction: AliasRedirectAction) {
    const command = this.commands.get(redirectAction.alias);
    if (!command) {
      return <ErrorAction>{
        type: 'error',
        err: new Error(`Chatbot was redirected to ${redirectAction.alias} but no command was registered with that alias`)
      };
    }
    const executionParams: ExecutionParameters = {
      command,
      parameters: redirectAction.parameters,
      args: redirectAction.args || []
    };
    return this.executeCommandWithAllMiddleware(executionParams);
  }

  private async handleCommandRedirect(redirectAction: CommandRedirectAction) {
    const executionParams: ExecutionParameters = {
      command: redirectAction.command,
      parameters: redirectAction.parameters,
      args: redirectAction.args || []
    };
    return this.executeCommandWithAllMiddleware(executionParams);
  }

  private async handleRedirect(redirectAction: RedirectAction) {
    if (isAliasRedirect(redirectAction)) {
      return this.handleAliasRedirect(redirectAction);
    } else if (isCommandRedirect(redirectAction)) {
      return this.handleCommandRedirect(redirectAction);
    } else {
      throw new Error('Invalid redirect action');
    }
  }

  private async executeCommandWithAllMiddleware(executionParams: ExecutionParameters) {
    return this.executeCommandWithPreMiddleware(executionParams, 0);
  }

  private async executeCommandWithPreMiddleware(executionParams: ExecutionParameters, index: number): Promise<ResponseAction> {
    if (index === this.preRoutingMiddleware.length) {
      return this.executeCommandWithMiddleware(executionParams, []);
    }
    const middleware = this.preRoutingMiddleware[index];
    const next = () => this.executeCommandWithPreMiddleware(executionParams, index + 1);
    return middleware.apply(null, next);
  }

  private async executeCommandWithMiddleware(executionParams: ExecutionParameters, commandMiddleware: Middleware[]) {
    const allMiddleware = this.middleware.concat(commandMiddleware);
    let response = await this.doExecuteCommandWithMiddleware(executionParams, allMiddleware, 0);
    if (isRedirect(response)) {
      response = await this.handleRedirect(response);
    }
    return response;
  }

  private async doExecuteCommandWithMiddleware(executionParams: ExecutionParameters, allMiddleware: Middleware[], middlewareIndex: number): Promise<ResponseAction> {
    if (middlewareIndex === allMiddleware.length) {
      return this.executeCommand(executionParams);
    }

    const next = () => this.doExecuteCommandWithMiddleware(executionParams, allMiddleware, middlewareIndex + 1);
    const middleware = allMiddleware[middlewareIndex];
    return middleware.apply(executionParams.parameters, executionParams.args, next);
  }

  private async executeCommand(executionParams: ExecutionParameters) {
    return executionParams.command.execute(executionParams.parameters, executionParams.args);
  }

}