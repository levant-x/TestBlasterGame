import { Component, Node, Prefab } from "cc";
import { Menu } from "./controllers/ui/menu";
import { UI } from "./controllers/ui/ui";
import { Task } from "./tools/common/task";

export type LevelConfig = {
    fieldWidth: number;
    fieldHeight: number;
    targetScore: number;
    stepsAvail: number;
    tileColorsAvail: number;
    shufflesAvail: number;
    bombsAvail: number;
    bombExplRadius: number;
    tilesetVolToDstr: number;
} & Record<string, number>;

export type LevelSystemConfig = {
    glossary: Record<string, string>;
    levelConfigs: LevelConfig[];
}

export type LevelInfo = {
    num: {
        current: number;
        total: number;
    };
    config: LevelConfig;
}

export enum Color {
    'blue' = 0,
    'green' = 1,
    'purple' = 2, 
    'red' = 3,
    'yellow' = 4,
};

export type StepResult  = 'next' | 'complete' | 'won' | 'lost';

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

export type Demand4NewTilesInfo = {
    col: number;
    lowestRow: number;
    tiles2Spawn: number;
}

export type EmptyCellsCount = {
    emptyCount: number;
    col: number;     
}

export type BoosterInfo = {
    type: BoosterType;
    count: number;
}

export type BooleanGetter = () => boolean;

export interface IClassifyable {
    getGroupID(): number | string;
}

export interface ITile extends Component, IClassifyable {
    readonly node: Node
    positionAtCell(gridCoordinates: GridCellCoordinates): void;
    moveToCellAsync(
        gridCoordinates: GridCellCoordinates,
        simultaneously?: boolean,
    ): BooleanGetter;
    getCellCoordinates(): GridCellCoordinates;  
    destroyHitAsync(): BooleanGetter; 
}

export interface IStepFlow {
    detectHitTiles(clickedTile: ITile): ITile[];
    destroyHitTiles(hitTiles?: ITile[]): Task;
    offsetLooseTiles(): Task;
    spawnNewTiles(): Task;
}

export interface IGameStatus {
    isStepValid(hitTiles: ITile[]): boolean;
    isStepFinal(): boolean;
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
    ): Task;
}

export interface IItemsGroupAnalyzer<T, R = undefined> {
    collectItemsGroup(
        startPointCoords: GridCellCoordinates[],
        select?: (item: T) => boolean
    ): T[] | R[];
}

export interface IItemsGapAnalyzer {
    getEmptyCellsGroupedByColumn(): Demand4NewTilesInfo[];
}

export interface IModal {
    onHide?: Function;
    show(target?: any): void;
    hide(): void;
}

export interface IScore {
    updateRate: number;
    gainPoints(deltaPoints: number): Task;
    getPoints(): number;
    reset(): void;
}

export interface ISteps {
    stepsNum: number;
}

export interface IBooster extends Pick<Component, 'node'> {
    tryApply(): boolean;
}

export interface IBoostNotifier {    
    getCurrentBooster(): BoosterType | null;
}

export interface IBoosterManager extends IBoostNotifier {
    registerBooster(booster: IBooster): BoosterInfo;
    tryApplyBooster(type: BoosterType): boolean;
    dropBoosterStatus(): void;    
}

export interface IStepInspector {
    isStepDeadEnd(
        levelInfo: LevelInfo, 
        uiManager: UI
    ): boolean;
}