
import { _decorator, __private, Vec3 } from 'cc';
import { loadLevelConfigAsync } from './tools/common/config-reader';
import { ModuleType } from './types';

const DI_MAPPING = {
    IGameFlow: ModuleType.GameFlow,
    IStepFlow: ModuleType.StepFlow,
    ITileSpawner: ModuleType.TileSpawner,
    IStepInspector: ModuleType.StepInspector,
    IItemsGroupAnalyzer: ModuleType.HitTilesFinderBoosted,
    IItemsGapAnalyzer: ModuleType.HitTilesFinderBase,
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
const TILES_MOVE_SPEED_UPS = 4;
const TILES_SHUFFLE_TIME_SEC = .8;
const FLOW_DELAY_SEC = 1.5;

export const CONFIG = {
    LAYOUT_ORIGIN_LEFT_BOTTOM,
    TILES_MOVE_SPEED_UPS,   
    TILES_SHUFFLE_TIME_SEC,
    FLOW_DELAY_SEC,
    BOOSTER_NAME_TMPL,
    loadLevelConfigAsync: () => _loadLvlCfgAsync(),
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

function _loadLvlCfgAsync(): ReturnType<typeof loadLevelConfigAsync> {
    return loadLevelConfigAsync(LEVEL_SYS_CFG_PATH);
}