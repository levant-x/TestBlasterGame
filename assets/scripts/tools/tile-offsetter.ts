
import { Component, Node } from 'cc';
import { 
    BooleanGetter, 
    GridCellCoordinates, 
    ITile, 
    TileOffsetInfo 
} from '../types';
import { Task } from './common/task';
import { GamefieldContext } from './gamefield-context';
import { LooseTilesFinder } from './loose-tiles-finder';
import { ToolsFactory } from './tools-factory';

export class TileOffsetter extends GamefieldContext {
    public onTileOffset?: (tile: ITile) => void;

    private _looseTilesFinder = ToolsFactory.get(
        LooseTilesFinder
    );

    public getTaskOffsetLooseTiles = (
        hitCellsCoords: GridCellCoordinates[]
    ): Task => {
        const selectorCbck = (tile: Component) => tile.isValid;
        const tilesOffsInfos = this
            ._looseTilesFinder
            .collectItemsGroup(hitCellsCoords, selectorCbck);
        const tilesOffsetTask = new Task();
        tilesOffsInfos
            .forEach(tileOffsInfo => tilesOffsetTask
            .bundleWith(this._getTileOffsetTask(tileOffsInfo)));
        return tilesOffsetTask;            
    }

    private _getTileOffsetTask(
        { tile, rowToSettleTo }: TileOffsetInfo
    ): BooleanGetter {
        const { col, row } = tile.getCellCoordinates();
        this._swapGridContents({ col, row }, rowToSettleTo);
        return tile.moveToCellAsync({ 
            col, row: rowToSettleTo 
        });
    }

    private _swapGridContents(
        { col, row }: GridCellCoordinates, 
        newRow: number
    ): void {
        const tileMoved = this.gamefield[col][row];
        this.gamefield[col][row] = this.gamefield[col][newRow];
        this.gamefield[col][newRow] = tileMoved;
    }
}