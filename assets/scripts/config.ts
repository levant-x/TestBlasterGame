
import { Vec3 } from 'cc';
import { LevelConfig, LevelSystemConfig, StringObj } from './types';

export class Config {
  public static layoutOriginLeftBottom: Vec3 = new Vec3(-430, -425);


  public static Parse4Level(
    source: LevelSystemConfig, level: number): LevelConfig {

    const keys = Object.keys(source.glossary);
    const res = {} as LevelConfig;

    for (const key of keys) 
      Config.ParsePropViaGlossary<LevelConfig>(key, source, res, level);
    return res;
  }

  private static ParsePropViaGlossary<T>(
    key: string, src: LevelSystemConfig, res: T, lvl: number) {

    const { glossary, levelConfigs } = src;
    if (levelConfigs.length <= lvl) throw 'Invalid gamelevel';

    const formulaKey = glossary[key];
    const configEntryVal = levelConfigs[lvl][formulaKey];
    (res as StringObj)[key] = configEntryVal;
  }
}