import { Command } from './command';

export interface Filter {
  allow(command: Command<any>, parameters: any, args: string[]): Promise<boolean>
}

export class Filters {

  static or(filters: Filter[]) {
    return <Filter> {
      allow: async (command: Command<any>, parameters: any, args: string[]) => {
        for (const filter of filters) {
          if (await filter.allow(command, parameters, args)) {
            return true;
          }
        }
        return false;
      }
    }
  }

  static and(filters: Filter[]) {
    return <Filter> {
      allow: async (command: Command<any>, parameters: any, args: string[]) => {
        for (const filter of filters) {
          if (!(await filter.allow(command, parameters, args))) {
            return false;
          }
        }
        return true;
      }
    }
  }

}