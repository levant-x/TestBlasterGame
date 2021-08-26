
import { GridCellCoordinates, IClassifyable } from '../types';
import { GamefieldContext } from './gamefield-context';

export class ItemGroupsAnalizer extends GamefieldContext {
    private _coordsSearchSwitchers = [
        ({ row, col }: GridCellCoordinates) => ({ row, col: col + 1, }),
        ({ row, col }: GridCellCoordinates) => ({ row, col: col - 1, }),
        ({ row, col }: GridCellCoordinates) => ({ row: row + 1, col, }),
        ({ row, col }: GridCellCoordinates) => ({ row: row - 1, col, }),
    ]

    public collectItemsGroup(
        { col, row }: GridCellCoordinates, targetGroup: IClassifyable) {  

        const itemsGroup: IClassifyable[] = [];
        this._collectItemsForGroup({ col, row }, targetGroup, itemsGroup);
        return itemsGroup;
    }

    private _collectItemsForGroup(
        posCoords: GridCellCoordinates, trgGroup: IClassifyable, 
        items: IClassifyable[]) {
        
        if (!this._areGridCellCoordsValid(posCoords)) return;
        const { row, col } = posCoords;
        const itemAtPoint = this.gamefield[col][row] as unknown as IClassifyable;

        if (itemAtPoint.getGroupID() !== trgGroup.getGroupID() || 
            items.find(item => item == itemAtPoint)) return; 
        items.push(itemAtPoint);

        const switchers = this._coordsSearchSwitchers;        
        for (const offsetCoord of switchers) this._collectItemsForGroup(
            offsetCoord(posCoords), trgGroup, items
        );
    }

    private _areGridCellCoordsValid({ col, row }: GridCellCoordinates) {
        const areCoordsValid = col >= 0 && col < this.witdh &&
            row >= 0 && row < this.height;
        return areCoordsValid;
    }
}