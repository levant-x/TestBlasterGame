
import { GridCellCoordinates, ITile } from '../types';
import { GamefieldContext } from './gamefield-context';
import { LooseTilesFinder } from './loose-tiles-finder';
import { ToolsFactory } from './tools-factory';

export class TileOffsetter extends GamefieldContext {
    public onTileOffset?: (tile: ITile) => void;

    private _tilesInMove: ITile[] = [];    
    private _fallingTilesFinder: LooseTilesFinder;

    constructor() {
        super();
        this._fallingTilesFinder = ToolsFactory.get(LooseTilesFinder);
    }

    public async offsetUpperTilesAsync(
        emptyCellsCoords: GridCellCoordinates[]) {

        
    }

    private _setupTileForOffset({
        col, row }: GridCellCoordinates, newRow: number) {
        const tileToMove = this.gamefield[col][row];
        this._tilesInMove.push(tileToMove);
        tileToMove.moveToCell({ col, row: newRow }, () => {
            this._onTileOffsetComplete(tileToMove);
        })
        this.gamefield[col][newRow] = this.gamefield[col][row];
    }

    private _onTileOffsetComplete(tile: ITile) {
        this._removeTileFromPool(tile);
        this.onTileOffset?.(tile);
    }

    private _removeTileFromPool(tile: ITile) {
        const tileIdxInPool = this._tilesInMove.indexOf(tile);
        this._tilesInMove.splice(tileIdxInPool, 1);
    }

    private async _waitForOffsetToCompleteAsync() {
        while (this._tilesInMove.length > 0) { }
    }
}