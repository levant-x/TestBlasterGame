import { GridCellCoordinates, IClassifyable, IItemsGroupAnalyzer as IItemsGroupFinder, ITile } from '../types';
import { GamefieldContext } from './gamefield-context';

type ItemSelector<T> = (item: T) => boolean;
type T = IClassifyable;

export class HitTilesFinder extends GamefieldContext 
    implements IItemsGroupFinder<T> {
    private _selectItem?: ItemSelector<T>;
    private _coordsSearchSwitchers = [
        ({ row, col }: GridCellCoordinates) => ({ row, col: col + 1, }),
        ({ row, col }: GridCellCoordinates) => ({ row, col: col - 1, }),
        ({ row, col }: GridCellCoordinates) => ({ row: row + 1, col, }),
        ({ row, col }: GridCellCoordinates) => ({ row: row - 1, col, }),
    ]

    public collectItemsGroup(
        [{ col, row }]: GridCellCoordinates[], 
        select: ItemSelector<T>): T[] {

        this._selectItem = select;
        const itemsGroup: T[] = [];
        this._collectItemsForGroup({ col, row }, itemsGroup);
        return itemsGroup;
    }

    private _collectItemsForGroup(
        posCoords: GridCellCoordinates, items: T[]) {
        
        if (!this._areGridCellCoordsValid(posCoords)) return;
        const { row, col } = posCoords;
        const itemAtPoint = this.gamefield[col][row] as unknown as T;

        if (!this._selectItem?.(itemAtPoint) || 
            items.includes(itemAtPoint)) return; 
        items.push(itemAtPoint);

        const switchers = this._coordsSearchSwitchers;        
        for (const offsetCoord of switchers) this._collectItemsForGroup(
            offsetCoord(posCoords), items
        );
    }

    private _areGridCellCoordsValid({ col, row }: GridCellCoordinates) {
        const areCoordsValid = col >= 0 && col < this.witdh &&
            row >= 0 && row < this.height;
        return areCoordsValid;
    }
}