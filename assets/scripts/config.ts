
import { Vec3 } from 'cc';
import { LevelConfig, LevelSystemConfig } from './types';

export class Config {
  public static LAYOUT_ORIGIN_LEFT_BOTTOM: Vec3 = new Vec3(-430, -425);
  public static TILES_OFFSET_DURATION_SEC = 0.3;

  public static Parse4Level(
    source: LevelSystemConfig, level: number): LevelConfig {

    const keys = Object.keys(source.glossary);
    const res = {} as LevelConfig;

    for (const key of keys) Config.ParsePropViaGlossary<
      LevelConfig
    >(key, source, res, level);
    return res;
  }

  private static ParsePropViaGlossary<
    T extends Record<string, any>
  >(
    key: string, src: LevelSystemConfig, res: T, lvl: number
  ) {
    const { glossary, levelConfigs } = src;
    if (levelConfigs.length <= lvl) throw 'Invalid gamelevel';

    const formulaKey = glossary[key];
    const configEntryVal = levelConfigs[lvl][formulaKey];
    (res as Record<string, any>)[key] = configEntryVal;
  }
}