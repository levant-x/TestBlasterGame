import { Component } from 'cc';
import { 
    Demand4NewTilesInfo, 
    GridCellCoordinates, 
    IClassifyable, 
    IItemsGroupAnalyzer
} from '../../types';
import { injectable } from '../../decorators';
import { GamefieldContext } from './gamefield-context';

type ItemSelector<T> = (item: T) => boolean;
type GCCAlias = GridCellCoordinates;
type GCSwitcher = (coords: GCCAlias) => GCCAlias;
type T = IClassifyable;

@injectable()
export class HitTilesFinder extends GamefieldContext 
    implements IItemsGroupAnalyzer<T> {

    private _selectItem: ItemSelector<T>;
    private _coordsSearchSwitchers: GCSwitcher[] = [
        coords => ({...coords, col: coords.col + 1}),
        coords => ({...coords, col: coords.col - 1}),
        coords => ({...coords, row: coords.row + 1}),
        coords => ({...coords, row: coords.row - 1}),
    ];

    collectItemsGroup = (
        [{ col, row }]: GridCellCoordinates[], 
        select?: ItemSelector<T>
    ): T[] => {
        const itemAtPoint = this.gamefield[col][row];
        const selectToUse = select || ((item: T) => 
            item.getGroupID() === itemAtPoint.getGroupID());
        this._selectItem = selectToUse;
        const itemsGroup: T[] = [];
        this._collectItems({ col, row }, itemsGroup);
        return itemsGroup;
    }

    getEmptyCellsGroupedByColumn() {
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