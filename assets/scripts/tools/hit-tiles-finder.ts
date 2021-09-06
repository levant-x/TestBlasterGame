import { Component } from 'cc';
import { 
    Demand4NewTilesInfo, 
    GridCellCoordinates, 
    IClassifyable, 
    IItemsGroupAnalyzer
} from '../types';
import { GamefieldContext } from './gamefield-context';

type ItemSelector<T> = (item: T) => boolean;
type T = IClassifyable;

export class HitTilesFinder extends GamefieldContext 
    implements IItemsGroupAnalyzer<T> {
    private _selectItem: ItemSelector<T> = (_: T) => {
        throw 'Item selector not specified'
    };
    private _coordsSearchSwitchers = [
        ({ row, col }: GridCellCoordinates) => ({ row, col: col + 1, }),
        ({ row, col }: GridCellCoordinates) => ({ row, col: col - 1, }),
        ({ row, col }: GridCellCoordinates) => ({ row: row + 1, col, }),
        ({ row, col }: GridCellCoordinates) => ({ row: row - 1, col, }),
    ]

    public collectItemsGroup(
        [{ col, row }]: GridCellCoordinates[], 
        select: ItemSelector<T>
    ): T[] {
        this._selectItem = select;
        const itemsGroup: T[] = [];
        this._collectItems({ col, row }, itemsGroup);
        return itemsGroup;
    }

    public getEmptyCellsGroupedByColumn() {
        const colsToEmptyCellsMap = this.gamefield
            .map(this._extractEmptyCellsInfo)
            .filter(infoItem => infoItem.tiles2Spawn > 0);
        return colsToEmptyCellsMap;
    }

    private _collectItems(
        crds: GridCellCoordinates, 
        items: T[]
    ): void {
        if (!this._areGridCellCoordsValid(crds)) return;
        const { row, col } = crds;
        const itemAtPoint = this.gamefield[col][row] as unknown as T;

        if (!this._selectItem(itemAtPoint) || 
            items.includes(itemAtPoint)) return; 
        items.push(itemAtPoint);

        const switchers = this._coordsSearchSwitchers;   
        switchers.forEach(offsetCoord => this
            ._collectItems(offsetCoord(crds), items))     
    }

    private _extractEmptyCellsInfo = (
        rows: Component[], 
        col: number
    ): Demand4NewTilesInfo => ({
        col,   
        lowestRow : this._findLowestEmptyRow(rows),
        tiles2Spawn: rows.reduce((acc, tile) => (
            tile.isValid ? acc : acc + 1
        ), 0)
    })

    private _findLowestEmptyRow(
        rows: Component[]
    ) {
        const hitTile = rows.find(tile => !tile.isValid);
        if (!hitTile) return 0;
        return rows.indexOf(hitTile);
    }

    private _areGridCellCoordsValid(
        { col, row }: GridCellCoordinates
    ): boolean {
        const areCoordsValid = col >= 0 && col < this.witdh &&
            row >= 0 && row < this.height;
        return areCoordsValid;
    }
}