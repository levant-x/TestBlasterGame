
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
const LAYOUT_ORIGIN_LEFT_BOTTOM: Vec3 = new Vec3(-385, -380);
const TILES_OFFSET_DURATION_SEC = 0.2;
const TILES_SHUFFLE_SPEEDUP = 3;
const TILES_1ST_FALL_SPEEDUP = 1.7;
const FLOW_DELAY_SEC = 1.5;
const BOOSTER_NAME_TMPL = 'booster-panel-';
const SUPERTILE_APPEAR_PROBAB = 7 / 10;

const TOOLS_TYPES = {
    IGameFlow: 'GameFlowBoosted',
    IStepFlow: 'StepFlow',
    ITileSpawner: 'TileSpawner',
    IItemsGroupAnalyzer: 'HitTilesFinderMultichoice',
    IItemsGapAnalyzer: 'HitTilesFinderBase',
    IStepInspector: 'StepInspector',
    IBoosterManager: 'BoosterManager',
    IBoostNotifier: 'BoosterManager',
    BoosterSupertile: 'BoosterSupertile',
    LooseTilesFinder: 'LooseTilesFinder',
    TileOffsetter: 'TileOffsetter',
    TileAsyncRespawner: 'TileAsyncRespawner',
    TileShuffler: 'TileShuffler',
};

export type Types = keyof typeof TOOLS_TYPES;

export type VALUE_KEYS = 'fieldHeight' | 'config';
    
export type RangeX = {
    left: number;
    right: number;
};

export type RangeY = {
    top: number;
    bottom: number;
};

export const CONFIG = {
    LAYOUT_ORIGIN_LEFT_BOTTOM,
    TILES_1ST_FALL_SPEEDUP,
    TILES_OFFSET_DURATION_SEC,   
    TILES_SHUFFLE_SPEEDUP,
    FLOW_DELAY_SEC,
    BOOSTER_NAME_TMPL,
    SUPERTILE_APPEAR_PROBAB,
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
    lvlNum: number, 
    resolve: (cnf: LevelInfo) => void
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
    source: LevelSystemConfig, 
    level: number,
): LevelInfo {
    const keys = Object.keys(source.glossary);
    const config = {} as LevelConfig;
    const { levelConfigs, glossary } = source;
    if (levelConfigs.length <= level) throw 'Invalid gamelevel';

    const cfgItem = source.levelConfigs[level];
    for (const key of keys) 
        _parsePropViaGlossary(key, glossary, cfgItem, config);
    return {
        config,
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