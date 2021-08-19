
import { GridCellCoordinates, IClassifyable } from '../types';

export class ItemGroupsAnalizer {
    private _fieldMap: IClassifyable[][] = [];
    private _fieldWidth = 0;
    private _fieldHeight = 0;
    private _coordsSearchSwitchers = [
        ({ row, col }: GridCellCoordinates) => ({ row, col: col + 1, }),
        ({ row, col }: GridCellCoordinates) => ({ row, col: col - 1, }),
        ({ row, col }: GridCellCoordinates) => ({ row: row + 1, col, }),
        ({ row, col }: GridCellCoordinates) => ({ row: row - 1, col, }),
    ]

    constructor(fieldMap: IClassifyable[][]) {
        this._fieldMap = fieldMap;
        this._fieldHeight = fieldMap.map(col => col.length)
            .reduce((acc, length) => acc > length ? acc : length, 0);
        this._fieldWidth = fieldMap.length;
    }

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
        const itemAtPoint = this._fieldMap[posCoords.col][posCoords.row];

        if (itemAtPoint.getGroupID() !== trgGroup.getGroupID() || 
            items.find(item => item == itemAtPoint)) return; 
        items.push(itemAtPoint);

        const switchers = this._coordsSearchSwitchers;        
        for (const offsetCoord of switchers) this._collectItemsForGroup(
            offsetCoord(posCoords), trgGroup, items
        );
    }

    private _areGridCellCoordsValid({ col, row }: GridCellCoordinates) {
        const { _fieldWidth, _fieldHeight } = this;
        const areCoordsValid = col >= 0 && col < _fieldWidth &&
            row >= 0 && row < _fieldHeight;
        return areCoordsValid;
    }
}