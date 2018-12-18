export interface BriefHelp {
  summary: string;
}

export interface DetailedHelp<T> extends BriefHelp {
  description: string;
  parameters: {[field in keyof T]: string};
  remarks?: string;
}

export function hasHelp(command: any): command is BriefHelp {
  return !!command.summary;
}

export function hasDetailedHelp(command: any): command is DetailedHelp<any> {
  return !!command.description;
}