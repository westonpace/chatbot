import { NoParameters, Command, Chatbot } from '../../chatbot';
import { ReplyAction, REPLY_ACTION } from '../../chatbot/response-action';
import { BriefHelp, DetailedHelp, hasHelp, hasDetailedHelp } from './help-interfaces';
import { Actions } from '../../chatbot/actions';

export interface BriefHelpRecord {
  path: string;
  help: BriefHelp;
}

const HELP_PREFIX = 'The following commands are available to you.  To get more information about a command or to filter' +
                    ' the list of commands you can specify what commands you are interested in.  For example `help bot` will' +
                    ' give you information about all commands that start with `bot`.'

export class PrintBriefHelpAction implements ReplyAction {

  type: 'reply' = REPLY_ACTION;

  constructor(private helps: BriefHelpRecord[]) {

  }

  get messageToSend() {
    return HELP_PREFIX + '\n\n' + this.helps.map(help => {
      return `${help.path} - ${help.help.summary}`;
    }).join('\n');
  }

}

export class PrintDetailedHelpAction implements ReplyAction {
  type: 'reply' = REPLY_ACTION;

  constructor(private path: string, private help: DetailedHelp<any>) {

  }

  get messageToSend() {
    const result = `${this.path}\n\n${this.help.description}\n` + 
    Object.keys(this.help.parameters).map(parameterName => {
      return `${parameterName} - ${this.help.parameters[parameterName]}`;
    }).join('\n');
    if (this.help.remarks) {
      return `${result}\n${this.help.remarks}`;
    } else {
      return result;
    }
  }
}

export class PrintHelpCommand implements Command<NoParameters>, BriefHelp {

  summary = 'Prints a list of available commands';

  constructor(private chatbot: Chatbot) {
    
  }

  async execute(_: NoParameters, args: string[]) {
    const path = (args.length === 0) ? null : args.join(' ');
    const routes = await this.chatbot.getCommandsStartingWith(path);
    const routesWithHelp = routes.filter(route => hasHelp(route.value.command));
    if (routesWithHelp.length === 1) {
      const route = routesWithHelp[0];
      if (hasDetailedHelp(route.value.command)) {
        return new PrintDetailedHelpAction(route.path, route.value.command);
      }
    }
    if (routesWithHelp.length === 0) {
      if (args.length === 0) {
        return Actions.reply('There do not appear to be any commands');
      } else {
        return Actions.reply('No commands matched the given prefix');
      }
    }
    return new PrintBriefHelpAction(routesWithHelp.map(route => {
      return <BriefHelpRecord> {
        help: route.value.command as unknown as BriefHelp,
        path: route.path
      };
    }));
  }

}