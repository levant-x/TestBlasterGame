
import { _decorator, Component } from 'cc';
import { 
    GridCellCoordinates, 
    IItemsGroupAnalyzer, 
    ITile, 
    TileOffsetInfo 
} from '../../types';
import { injectable } from '../../decorators';
import { GamefieldContext } from './gamefield-context';

type Col2RowsMap = Record<number, number[]>;

@injectable()
export class LooseTilesFinder extends GamefieldContext 
    implements IItemsGroupAnalyzer<Component, TileOffsetInfo> {
    private _crrRowToOffsetTo = 0;
    private _crrRowToSrchFrom = 0;
    private _selectItem?: (item: Component) => boolean;

    collectItemsGroup = (
        hitTilesCoords: GridCellCoordinates[], 
        select: (item: Component) => boolean
    ) => {
        this._selectItem = select;
        const cols2RowsMap = hitTilesCoords
            .reduce(this._groupRowsByCol, {});
        const tileOffsetInfos = (Object.entries(cols2RowsMap))
            .map(this._convertRowsToTilesOffsetInfos)
            .reduce((acc, map) => [...acc, ...map], []); 
        return tileOffsetInfos as TileOffsetInfo[];
    }

    private _groupRowsByCol = (
        col2RowsMap: Col2RowsMap, 
        { row, col }: GridCellCoordinates
    ): Col2RowsMap => {
        const colRows = col2RowsMap[col];  
        if (colRows) colRows.push(row);
        else col2RowsMap[col] = [row];
        return col2RowsMap;
    }

    private _convertRowsToTilesOffsetInfos = (
        [col, rows]: [string, number[]]
    ) => {
        const minRow = Math.min(...rows);
        this._crrRowToSrchFrom = minRow + 1;
        this._crrRowToOffsetTo = minRow;
        const looseTilesInfos = this
            ._collectTilesOffsetInfo(this.gamefield[+col]);
        return looseTilesInfos;
    }

    private _collectTilesOffsetInfo(
        tilesCol: ITile[]
    ): TileOffsetInfo[] {
        const looseTiles: TileOffsetInfo[] = []
        const startRow = this._crrRowToSrchFrom;
        for (let row = startRow; row < this.height; row++)
            this._collectTileInfoIfPossible(
                tilesCol[row], looseTiles);                        
        return looseTiles;
    }

    private _collectTileInfoIfPossible(
        tile: ITile, 
        looseTiles: TileOffsetInfo[]
    ): void {
        if (!this._selectItem?.(tile)) return;            
        looseTiles.push(this._extractTileOffsetInfo(tile));   
        this._crrRowToOffsetTo++;
    }

    private _extractTileOffsetInfo(
        tile: ITile
    ): TileOffsetInfo {
        return {
            rowToSettleTo: this._crrRowToOffsetTo,
            tile,
        } as TileOffsetInfo;
    }
}