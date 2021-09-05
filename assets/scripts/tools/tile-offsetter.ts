
import { Component } from 'cc';
import { GridCellCoordinates, ITile, TileOffsetInfo } from '../types';
import { GamefieldContext } from './gamefield-context';
import { LooseTilesFinder } from './loose-tiles-finder';
import { Task } from './task';
import { ToolsFactory } from './tools-factory';

export class TileOffsetter extends GamefieldContext {
    public onTileOffset?: (tile: ITile) => void;

    private _tilesInMove: ITile[] = [];    
    private _looseTilesFinder = ToolsFactory.get(LooseTilesFinder);

    public getTaskOffsetLooseTiles = (
        hitCellsCoords: GridCellCoordinates[]
    ) => {
        const tilesOffsInfos = this
            ._looseTilesFinder.collectItemsGroup(
            hitCellsCoords, tileNode => tileNode.active
        );
        const tilesOffsetTask = new Task();
        tilesOffsInfos.forEach(
            tileOffsInfo => tilesOffsetTask.bundleWith(
            this._getTileOffsetTask(tileOffsInfo)
        ));
        return tilesOffsetTask;            
    }

    public getEmptyCellsGroupedByColumn() {
        const colsToEmptyCellsMap = this.gamefield
            .map(this._extractEmptyCellsCnt)
            .filter(empCllCntInfo => empCllCntInfo.emptyCount > 0);
        return colsToEmptyCellsMap;
    }

    private _getTileOffsetTask({ 
        tile, rowToSettleTo }: TileOffsetInfo
    ) {
        this._tilesInMove.push(tile);        
        const { col, row } = tile.getCellCoordinates();
        const newRow = rowToSettleTo;
        this._swapGridContents({ col, row }, newRow);
        return tile.moveToCellAsync({ 
            col, row: newRow 
        });
    }

    private _swapGridContents(
        { col, row }: GridCellCoordinates, 
        newRow: number
    ) {
        const tileMoved = this.gamefield[col][row];
        this.gamefield[col][row] = this.gamefield[col][newRow];
        this.gamefield[col][newRow] = tileMoved;
    }

    private _extractEmptyCellsCnt = (
        rows: Component[], col: number
    ) => ({
        col,     
        emptyCount: rows.reduce((acc, tile) => (
            tile.enabled ? acc : acc++
        ), 0),           
    })
}