
import { GridCellCoordinates, ITile, TileOffsetInfo } from '../types';
import { GamefieldContext } from './gamefield-context';
import { LooseTilesFinder } from './loose-tiles-finder';
import { ToolsFactory } from './tools-factory';

export class TileOffsetter extends GamefieldContext {
    public onTileOffset?: (tile: ITile) => void;

    private _tilesInMove: ITile[] = [];    
    private _looseTilesFinder: LooseTilesFinder;

    constructor() {
        super();
        this._looseTilesFinder = ToolsFactory.get(LooseTilesFinder);
    }

    public async offsetLooseTilesAsync(
        hitCellsCoords: GridCellCoordinates[]
    ) {
        const tilesToMove = this._looseTilesFinder.collectItemsGroup(
            hitCellsCoords, tileNode => tileNode.active
        );
        for (const tileInfo of tilesToMove) this._setupTileForOffset(
            tileInfo
        );
        await this._waitForOffsetToCompleteAsync();
    }

    private _setupTileForOffset({ 
        tile, rowToSettleTo }: TileOffsetInfo
    ) {
        this._tilesInMove.push(tile);        
        const { col, row } = tile.getCellCoordinates();
        const newRow = rowToSettleTo;
        tile.moveToCell({ col, row: newRow }, () => {
            this._onTileOffsetComplete(tile);
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