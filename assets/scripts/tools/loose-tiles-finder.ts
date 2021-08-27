
import { _decorator, Node } from 'cc';
import { GridCellCoordinates, IItemsGroupAnalyzer, ITile, TileOffsetInfo } from '../types';
import { GamefieldContext } from './gamefield-context';

type Col2MinRowsMap = Record<number, number>;

export class LooseTilesFinder extends GamefieldContext 
    implements IItemsGroupAnalyzer<Node, TileOffsetInfo> {
    private _crrRowToOffsetTo = 0;
    private _crrRowToSrchFrom = 0;
    private _selectItem?: (item: Node) => boolean;

    public collectItemsGroup = (
        hitTilesCoords: GridCellCoordinates[], 
        select: (item: Node) => boolean
    ) => {
        this._selectItem = select;
        const cols2RowsMap = hitTilesCoords
            .reduce(this._groupMinRowsByCol, {});
        const tile_newPos_maps = (Object.entries(cols2RowsMap))
            .map(this._convertRowsToLooseTilesInfo)
            .filter(map => map && true)
            .reduce((acc, map) => [...acc, ...map], []); 
        return tile_newPos_maps as TileOffsetInfo[];
    }

    private _groupMinRowsByCol(
        col2MinRowsMap: Col2MinRowsMap, 
        hitTileCrds: GridCellCoordinates
    ) {
        const knownMinRow = col2MinRowsMap[hitTileCrds.col];
        if (!knownMinRow || hitTileCrds.row < knownMinRow) 
            col2MinRowsMap[hitTileCrds.col] = hitTileCrds.row;
        return col2MinRowsMap;
    }

    private _convertRowsToLooseTilesInfo = (
        [col, minRow]: [string, number]
    ) => {
        this._crrRowToSrchFrom = minRow + 1;
        this._crrRowToOffsetTo = minRow;
        const looseTilesInfos = this._collectLooseTilesInfo(
            this.gamefield[+col]
        );
        return looseTilesInfos;
    }

    private _collectLooseTilesInfo(tilesCol: ITile[]) {
        const looseTiles: TileOffsetInfo[] = []
        const startRow = this._crrRowToSrchFrom;
        for (let row = startRow; row < this.height; row++)
            this._collectTileInfoIfPossible(
                tilesCol[row], looseTiles);                        
        return looseTiles;
    }

    private _collectTileInfoIfPossible(
        tile: ITile, looseTiles: TileOffsetInfo[]
    ) {
        if (!this._selectItem?.(tile.node)) return;            
        looseTiles.push(this._extractLooseTileInfo(tile));   
        this._crrRowToOffsetTo++;
    }

    private _extractLooseTileInfo(tile: ITile) {
        return {
            rowToSettleTo: this._crrRowToOffsetTo,
            tile,
        } as TileOffsetInfo;
    }
}