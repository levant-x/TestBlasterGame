
import { _decorator, resources, JsonAsset, __private, Vec3 } from 'cc';
import { HitTilesFinder } from './tools/hit-tiles-finder';
import { LooseTilesFinder } from './tools/loose-tiles-finder';
import { TileOffsetter } from './tools/tile-offsetter';
import { TileSpawner, TileSpawnerArgs } from './tools/tile-spawner';
import { LevelConfig, LevelSystemConfig } from './types';

type Type<T> = __private.Constructor<T>;

const LEVEL_SYS_CFG_PATH = 'level-sys-config';
export const LOADER_SCENE_NAME = 'scene-switcher';
export const DEFAULT_SCENE_NAME = 'game';
export const LAYOUT_ORIGIN_LEFT_BOTTOM: Vec3 = new Vec3(-430, -425);
export const TILES_OFFSET_DURATION_SEC = 0.2;
export const TILES_1ST_FALL_SPEEDUP = 1.7;

const toolsTypes: Record<string, (args?: any) => any> = {
    TileSpawner: (
        args: TileSpawnerArgs
    ) => new TileSpawner(args),
    HitTilesFinder: () => new HitTilesFinder(),
    LooseTilesFinder : () => new LooseTilesFinder(),
    TileOffsetter: () => new TileOffsetter(),
}

export const CONFIG = {
    get,
    loadLevelConfigAsync,
}

function get<T>(
    type: Type<T>, args?: any
): T {
    const typeName = type.name;
    const ctor = toolsTypes[typeName];
    if (!ctor) throw `Creator for ${typeName} not found`;
    else return ctor(args);
}

function loadLevelConfigAsync(
    gamelevel: number
): Promise<LevelConfig> {
    return new Promise<
        LevelConfig
    >(resolve => loadLvlCnf(gamelevel, resolve));
}

function loadLvlCnf(
    lvlNum: number, resolve: (cnf: LevelConfig) => void
): void {
    resources.load(LEVEL_SYS_CFG_PATH, (
        er, config: JsonAsset
    ) => {
        if (er) throw er;
        else if (!config) throw 'Config was loaded empty';
        const cfg = parseLevelConfig(
            config.json as LevelSystemConfig, lvlNum);
        resolve(cfg);
    });   
}

function parseLevelConfig(
    source: LevelSystemConfig, level: number
): LevelConfig {
    const keys = Object.keys(source.glossary);
    const cfgObj = {} as LevelConfig;
    const { levelConfigs, glossary } = source;
    if (levelConfigs.length <= level) throw 'Invalid gamelevel';

    const cfgItem = source.levelConfigs[level];
    for (const key of keys) parsePropViaGlossary(
        key, glossary, cfgItem, cfgObj
    );
    return cfgObj;
}

function parsePropViaGlossary(
    key: string, 
    glossary: Record<string, string>,
    configItemJson: LevelConfig,
    configObj: LevelConfig, 
): void {
    const glossKey = glossary[key];
    let configEntryVal = +configItemJson[glossKey];
    if (!configEntryVal) throw `${key} config invalid`;
    configObj[key] = configEntryVal;
}