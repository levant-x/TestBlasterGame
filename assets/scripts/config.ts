
import { _decorator, resources, JsonAsset, __private, Vec3 } from 'cc';
import { LevelConfig, LevelInfo, LevelSystemConfig, ModuleType } from './types';

const DI_MAPPING = {
    IGameFlow: ModuleType.GameFlow,
    IStepFlow: ModuleType.StepFlow,
    ITileSpawner: ModuleType.TileSpawner,
    IStepInspector: ModuleType.StepInspector,
    IItemsGroupAnalyzer: ModuleType.HitTilesFinderMultichoice,
    IItemsGapAnalyzer: ModuleType.HitTilesFinderMultichoice,
    TileOffsetter: ModuleType.TileOffsetter,
    TileAsyncRespawner: ModuleType.TileAsyncRespawner,
    TileShuffler: ModuleType.TileShuffler,
}

export type DependencyKey = keyof typeof DI_MAPPING;

export type ValueDispatchKey = 'fieldHeight' | 'config' | 'stepCooldown';
    
export type RangeX = {
    left: number;
    right: number;
};

export type RangeY = {
    top: number;
    bottom: number;
};

const LEVEL_SYS_CFG_PATH = 'level-sys-config';
const BOOSTER_NAME_TMPL = 'booster-panel-';
const LAYOUT_ORIGIN_LEFT_BOTTOM: Vec3 = new Vec3(-385, -380);
const MULTIINSTANCE: ModuleType[] = [];
const TILES_FALL_SIZE_FR_DELAY = .15;
const TILES_MOVE_SPEED_UPS = 4;
const TILES_SHUFFLE_TIME_SEC = .8;
const FLOW_DELAY_SEC = 1.5;

export const CONFIG = {
    LAYOUT_ORIGIN_LEFT_BOTTOM,
    TILES_MOVE_SPEED_UPS,   
    TILES_SHUFFLE_TIME_SEC,
    TILES_FALL_SIZE_FR_DELAY,
    FLOW_DELAY_SEC,
    BOOSTER_NAME_TMPL,
    loadLevelConfigAsync,
    di: {
        isSingleton,
        getImplementationInfo,
    }
}

function isSingleton(
    dependency: ModuleType
): boolean {
    return !MULTIINSTANCE.includes(dependency);
}

function getImplementationInfo(
    dependencyKey: DependencyKey
): ModuleType {
    const implemInfo = DI_MAPPING[dependencyKey];
    if (implemInfo === undefined) 
        throw `Dependency for ${dependencyKey} not set`;
    return <ModuleType>implemInfo;
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