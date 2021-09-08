
import { Vec3 } from 'cc';
import { LevelConfig, LevelSystemConfig } from './types';

export const LAYOUT_ORIGIN_LEFT_BOTTOM: Vec3 = new Vec3(-430, -425);
export const TILES_OFFSET_DURATION_SEC = 0.2;
export const TILES_1ST_FALL_SPEEDUP = 1.7;

export class Config {
    public static ParseLevelConfig(
        source: LevelSystemConfig, level: number
    ): LevelConfig {
        const keys = Object.keys(source.glossary);
        const res = {} as LevelConfig;

        for (const key of keys) Config.parsePropViaGlossary(
            key, source, res, level
        );
        return res;
    }

    protected static parsePropViaGlossary(
        key: string, 
        { glossary, levelConfigs }: LevelSystemConfig, 
        res: LevelConfig, 
        lvl: number,
    ): void {
        if (levelConfigs.length <= lvl) throw 'Invalid gamelevel';
        const glossKey = glossary[key];
        let configEntryVal = +levelConfigs[lvl][glossKey];
        if (!configEntryVal) throw `${key} config invalid`;
        res[key] = configEntryVal;
    }
}