import { Component } from 'cc';
import { 
    Demand4NewTilesInfo, 
    GridCellCoordinates, 
    IClassifyable, 
    IItemsGapAnalyzer, 
    IItemsGroupAnalyzer,
} from '../../../types';
import { injectable } from '../../../decorators';
import { GamefieldContext } from '../gamefield-context';

type ItemSelector<T> = (item: T) => boolean;
type GCCAlias = GridCellCoordinates;
type GCSwitcher = (coords: GCCAlias) => GCCAlias;
type T = IClassifyable;
export type ItemType = T;

@injectable('HitTilesFinderBase')
export class HitTilesFinderBase
    extends GamefieldContext 
    implements IItemsGroupAnalyzer<T>, IItemsGapAnalyzer {

    private _selectItem: ItemSelector<T>;
    private _coordsSearchSwitchers: GCSwitcher[] = [
        coords => ({...coords, col: coords.col + 1}),
        coords => ({...coords, col: coords.col - 1}),
        coords => ({...coords, row: coords.row + 1}),
        coords => ({...coords, row: coords.row - 1}),
    ];

    collectItemsGroup(
        [{ col, row }]: GridCellCoordinates[], 
        select?: ItemSelector<T>
    ): T[] {
        const itemAtPoint = this.gamefield[col][row];
        const itemSelector = select || ((otherItem: T) => 
            itemAtPoint.groupID === otherItem.groupID);
        this._selectItem = itemSelector;

        const itemsGroup: T[] = [];
        this.runItemsCollect({ col, row }, itemsGroup);
        return itemsGroup;
    }

    getEmptyCellsGroupedByColumn() {
        const colsToEmptyCellsMap = this.gamefield
            .map(this._extractEmptyCellsInfo)
            .filter(infoItem => infoItem.tiles2Spawn > 0);
        return colsToEmptyCellsMap;
    }

    protected runItemsCollect(
        crds: GridCellCoordinates, 
        itemsGroup: T[],
    ): void {
        this._collectItems(crds, itemsGroup);
    }

    private _collectItems(
        crds: GridCellCoordinates, 
        items: T[]
    ): void {
        if (!this._areGridCellCoordsValid(crds)) return;
        const { row, col } = crds;
        const itemAtPoint = this.gamefield[col][row] as unknown as T;

        const itemFits = this._selectItem(itemAtPoint) &&
            !items.includes(itemAtPoint);
        if (!itemFits) return; 

        items.push(itemAtPoint);
        const switchers = this._coordsSearchSwitchers;   
        const collect = this._collectItems.bind(this);
        switchers.forEach(around => collect(around(crds), items))     
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
    ): number {
        const hitTile = rows.find(tile => !tile.isValid);
        if (!hitTile) return 0;
        return rows.indexOf(hitTile);
    }

    private _areGridCellCoordsValid(
        { col, row }: GridCellCoordinates
    ): boolean {
        const areCoordsValid = col >= 0 && col < this.width &&
            row >= 0 && row < this.height;
        return areCoordsValid;
    }
}