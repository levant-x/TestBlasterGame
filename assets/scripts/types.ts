import { Component } from "cc";
import { Tile } from "./controllers/tile";

export type LevelConfig = Record<string, string> & {
    fieldWidth: number;
    fieldHeight: number;
    targetScore: number;
    leadsAvail: number;
    tileColorsAvail: number;
    tileShufflesAvail: number;
    tilesetVolToDstr: number;
}

export type LevelSystemConfig = {
    glossary: Record<string, any>;
    levelConfigs: [];
}

export enum Color {
    'blue' = 0,
    'green' = 1,
    'purple' = 2, 
    'red' = 3,
    'yellow' = 4,
};

export type TileSpawnCallback = (tileLogic: Tile) => void;

export type GridCellCoordinates = {
    row: number;
    col: number;
}

export type TileOffsetInfo = {
    rowToSettleTo: number;
    tile: ITile;
}

export type EmptyCellsCount = {
    emptyCount: number;
    col: number;     
}

export interface IClassifyable {
    getGroupID(): number | string;
}

export interface ITile extends Component, IClassifyable {
    positionAtCell(gridCoordinates: GridCellCoordinates): void;
    moveToCellAsync(gridCoordinates: GridCellCoordinates): Promise<void>;
    getCellCoordinates(): GridCellCoordinates;  
    destroyHitAsync(): Promise<void>;    
}

export interface IItemsGroupAnalyzer<T, R = undefined> {
    collectItemsGroup(
        startPointCoords: GridCellCoordinates[],
        select: (item: T) => boolean
    ): T[] | R[];
}