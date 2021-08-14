export type StringObj = {
  [key: string]: any;
}

export type LevelConfig = StringObj & {
  fieldWidth: number;
  fieldHeight: number;
  targetScore: number;
  leadsAvail: number;
  tileColorsAvail: number;
  tileShufflesAvail: number;
  tilesetVolToDstr: number;
}

export type LevelSystemConfig = {
  glossary: StringObj;
  levelConfigs: [];
}

export type Color = 'blue' | 'green' | 'purple' | 'red' | 'yellow';