
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

const _LEVEL_SYS_CFG_PATH = 'level-sys-config';
const _MULTIINSTANCE: ModuleType[] = [];

export const CONFIG = {
    LOADER_SCENE_NAME: 'scene-switcher',
    GAME_SCENE_NAME: 'game',
    LAYOUT_ORIGIN_LEFT_BOTTOM: new Vec3(-385, -380),
    BOOSTER_NAME_TMPL: 'booster-panel-',
    loadLevelConfigAsync: () => _loadLvlCfgAsync(),
    TILES_MOVE_SPEED_UPS: 4,   
    TILES_SHUFFLE_TIME_SEC: .8,
    // TILES_DESTROY_TIME_SEC: .6,
    CALLBACKS_NUM_2CLEANUP: 50,
    FLOW_DELAY_SEC: 1.5,
    di: {
        isSingleton,
        getImplementationInfo,
    }
}

function isSingleton(
    dependency: ModuleType
): boolean {
    return !_MULTIINSTANCE.includes(dependency);
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
    return loadLevelConfigAsync(_LEVEL_SYS_CFG_PATH);
}