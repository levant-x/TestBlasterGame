import { Component, Node, Prefab } from "cc";
import { Menu } from "./controllers/ui/menu";
import { UI } from "./controllers/ui/ui";
import { Task } from "./tools/common/task";

export enum ModuleType {
    'GameFlowBoosted',
    'GameFlow',
    'HitTilesFinderBase',
    'HitTilesFinderMultichoice',
    'StepFlow',
    'StepInspector',
    'TileAsyncRespawner',
    'TileOffsetter',    
    'TileShuffler',
    'TileSpawner'
}

export type LevelConfig = Record<string, number> & {
    fieldWidth: number;
    fieldHeight: number;
    targetScore: number;
    tileColorsTotal: number;
    shufflesTotal: number;
    stepsTotal: number;
    bombsTotal: number;
    bombExplRadius: number;
    tilesetVolToDstr: number;
    supertileChance: number;
};

export type LevelSystemConfig = {
    glossary: Record<string, string>;
    configShift: Record<string, string>;
    baseConfig: LevelConfig;
}

export type LevelInfo = LevelConfig;

export enum Color {
    'blue' = 0,
    'green' = 1,
    'purple' = 2, 
    'red' = 3,
    'yellow' = 4,
};

export type StepResult  = 'complete' | 'won' | 'lost';

export type BoosterType = 'shuffle' | 'bomb' | 'supertile';

export type TileSpawnCallback = (newTile: ITile) => void;

export type GridCellCoordinates = {
    row: number;
    col: number;
}

export type TileOffsetInfo = {
    rowToSettleTo: number;
    tile: ITile;
}

export type StepResultByColsInfo = {
    colsIndex: number[],
    colsInfo: Record<number, {
        lowestRow: number;
        highestRow: number;
        tiles2Spawn: number;
    }>
}

export type EmptyCellsCount = {
    emptyCount: number;
    col: number;     
}

export type BooleanGetter = () => boolean;

export interface IClassifyable {
    readonly groupID: number | string;
}

export interface ITile extends Component, IClassifyable {
    readonly node: Node
    readonly сellCoordinates: GridCellCoordinates;  
    positionAtCell(gridCoordinates: GridCellCoordinates): void;
    moveToCellAsync(
        gridCoordinates: GridCellCoordinates,
        fixedTime?: boolean,
    ): BooleanGetter;
    destroyHitAsync(): BooleanGetter; 
}

export interface ISupertile extends ITile {
    isSuper: boolean;
}

export interface IStepFlow {
    detectHitTiles(clickedTile: ITile): ITile[];
    destroyHitTilesAsync(hitTiles?: ITile[]): Task;
    offsetLooseTilesAsync(): Task;
    spawnNewTilesAsync(): Task;
}

export interface IGameStatus {
    readonly isStepFinal: boolean;
    isStepValid(hitTiles: ITile[]): boolean;
    runStepResult(): void;    
}

export interface IGameFlow extends IGameStatus {
    uiManager: UI;
    menu: Menu;
    setupGameStart(levelInfo: LevelInfo): Task;
    updateUI(pointsNum: number): Task;    
}

export interface ITileSpawner {
    rowsNum: number;
    colsNum: number;
    prefabs: Prefab[];
    targetNode: Node;
    onTileSpawn?: TileSpawnCallback;
    seedGamefield(): void;
    spawnNewTile(
        finalCoords: GridCellCoordinates, 
        fieldHeight: number,
        originElevation?: number,
    ): Task;
}

export interface IItemsGroupAnalyzer<T, R = undefined> {
    collectItemsGroup(
        startPointCoords: GridCellCoordinates[],
        select?: (item: T) => boolean
    ): T[] | R[];
}

export interface IItemsGapAnalyzer {
    getStepResultByColsInfo(
        hitTiles: ITile[]
    ): StepResultByColsInfo;
}

export interface IModal {
    onHide?: Function;
    show(target?: any): void;
    hide(): void;
}

export interface IScore {
    updateRate: number;
    readonly points: number;
    gainPoints(deltaPoints: number): Task;
    reset(): void;
}

export interface ISteps {
    stepsNum: number;
}

export interface IBooster extends Pick<Component, 'node'> {
    readonly type: BoosterType;
    tryApply(): boolean;
    drop(): void;    
}

export interface IStepInspector {
    isStepDeadEnd(
        levelInfo: LevelInfo, 
        uiManager: UI
    ): boolean;
}