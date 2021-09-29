
import { 
    _decorator, 
    resources, 
    JsonAsset, 
    __private, 
    Vec3 
} from 'cc';
import { 
    LevelConfig, 
    LevelInfo, 
    LevelSystemConfig 
} from './types';

const LEVEL_SYS_CFG_PATH = 'level-sys-config';
const LOADER_SCENE_NAME = 'scene-switcher';
const DEFAULT_SCENE_NAME = 'game';
const LAYOUT_ORIGIN_LEFT_BOTTOM: Vec3 = new Vec3(-430, -425);
const TILES_OFFSET_DURATION_SEC = 0.2;
const TILES_SHUFFLE_SPEEDUP = 3;
const TILES_1ST_FALL_SPEEDUP = 1.7;

const TOOLS_TYPES = {
    ITileSpawner: 'TileSpawner',
    IGameFlow: 'GameFlow',
    IStepFlow: 'StepFlow',
    HitTilesFinder: 'HitTilesFinder',
    LooseTilesFinder: 'LooseTilesFinder',
    TileOffsetter: 'TileOffsetter',
    TileAsyncRespawner: 'TileAsyncRespawner',
    IBoosterManager: 'BoosterManager',
    TileShuffler: 'TileShuffler',
};

const VALUE_KEYS = {
    fieldHeight: 'fh',
    config: 'cfg',
}

export type Types = keyof typeof TOOLS_TYPES;

export const CONFIG = {
    LOADER_SCENE_NAME,
    DEFAULT_SCENE_NAME,
    LAYOUT_ORIGIN_LEFT_BOTTOM,
    TILES_1ST_FALL_SPEEDUP,
    TILES_OFFSET_DURATION_SEC,   
    TILES_SHUFFLE_SPEEDUP,
    VALUE_KEYS, 
    loadLevelConfigAsync,
    getDependencyName,
}

function getDependencyName(
    type: Types
): string {
    return TOOLS_TYPES[type];
} 

function loadLevelConfigAsync(
    gamelevel: number
): Promise<LevelInfo> {
    return new Promise<
        LevelInfo
    >(resolve => _loadLvlCnf(gamelevel, resolve));
}

function _loadLvlCnf(
    lvlNum: number, resolve: (cnf: LevelInfo) => void
): void {
    resources.load(LEVEL_SYS_CFG_PATH, (
        er, config: JsonAsset
    ) => {
        if (er) throw er;
        else if (!config) throw 'Config was loaded empty';
        const cfg = _parseLevelConfig(
            config.json as LevelSystemConfig, lvlNum);
        resolve(cfg);
    });   
}

function _parseLevelConfig(
    source: LevelSystemConfig, level: number
): LevelInfo {
    const keys = Object.keys(source.glossary);
    const cfgObj = {} as LevelConfig;
    const { levelConfigs, glossary } = source;
    if (levelConfigs.length <= level) throw 'Invalid gamelevel';

    const cfgItem = source.levelConfigs[level];
    for (const key of keys) _parsePropViaGlossary(
        key, glossary, cfgItem, cfgObj
    );
    return {
        config: cfgObj,
        num: {
            current: level,
            total: levelConfigs.length,
        },
    } as LevelInfo;
}

function _parsePropViaGlossary(
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