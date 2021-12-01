import { 
    StepResultByColsInfo, 
    GridCellCoordinates, 
    IClassifyable, 
    IItemsGapAnalyzer, 
    IItemsGroupAnalyzer,
    ITile,
} from '../../../types';
import { injectable } from '../../../decorators';
import { GamefieldContext } from '../gamefield-context';

type GCCAlias = GridCellCoordinates;
type GCSwitcher = (coords: GCCAlias) => GCCAlias;
type T = IClassifyable;

export type ItemType = T;
export type ItemSelector<T> = (item: T) => boolean;

@injectable('HitTilesFinderBase')
export class HitTilesFinderBase extends GamefieldContext 
    implements IItemsGroupAnalyzer<T>, IItemsGapAnalyzer {

    private _selectItem: ItemSelector<T>;
    private _lookedUpCellsIndexes: number[];
    private _coordsSearchSwitchers: GCSwitcher[] = [
        coords => ({...coords, col: coords.col + 1}),
        coords => ({...coords, col: coords.col - 1}),
        coords => ({...coords, row: coords.row + 1}),
        coords => ({...coords, row: coords.row - 1}),
    ];

    collectItemsGroup(
        [crds]: GridCellCoordinates[], 
        select?: ItemSelector<T>
    ): T[] {
        const itemAtPoint = this.gamefield[crds.col][crds.row];
        const itemSelector = select || ((otherItem: T) => 
            itemAtPoint.groupID === otherItem.groupID);
        this._selectItem = itemSelector;

        const startItemIndex = GamefieldContext.get().linear(crds);
        this._lookedUpCellsIndexes = [startItemIndex];

        const itemsGroup: T[] = [];        
        this.runItemsCollect(crds, itemsGroup);
        return itemsGroup;
    }

    getStepResultByColsInfo(
        hitTiles: ITile[]
    ): StepResultByColsInfo {  
        const stepRslInfo: StepResultByColsInfo = {
            colsIndex: [],
            colsInfo: {},
        };
        for (let i = 0; i < hitTiles.length; i++) 
            this._analyzeHitTile(hitTiles[i], stepRslInfo);
        return stepRslInfo;
    }

    /**Collects items the normal wave way */
    protected runItemsCollect(
        crds: GCCAlias, 
        itemsGroup: T[],
    ): void {
        this._collectItems(crds, itemsGroup);
    }

    private _collectItems(
        crds: GCCAlias, 
        items: T[]
    ): void {
        const { row, col } = crds;
        const itemAtPoint = <T>this.gamefield[col][row];  

        const itemFits = this._selectItem(itemAtPoint);
        if (itemFits) items.push(itemAtPoint);
        else return;

        const switchers = Object.entries(this._coordsSearchSwitchers);
        for (const [_, offset] of switchers) {
            const newCrds = offset(crds);
            
            if (!this._toUseOffset(newCrds)) continue;            
            this._collectItems(newCrds, items);
        }
    }

    private _toUseOffset(
        crds: GCCAlias
    ): boolean {
        if (!this._areGridCellCoordsValid(crds)) return false;

        const cellIndex = GamefieldContext.get().linear(crds);
        const lookedUp = this._lookedUpCellsIndexes.includes(cellIndex);

        !lookedUp && this._lookedUpCellsIndexes.push(cellIndex);
        return !lookedUp;
    }

    private _areGridCellCoordsValid(
        { col, row }: GCCAlias
    ): boolean {
        const areCoordsValid = col >= 0 && col < this.width &&
            row >= 0 && row < this.height;
        return areCoordsValid;
    }

    private _analyzeHitTile(
        hitTile: ITile,
        stepRslInfo: StepResultByColsInfo,
    ): void {
        const colInfo = this._initInfoItem(
            hitTile.сellCoordinates.col, stepRslInfo);
        const { row, col } = hitTile.сellCoordinates;

        if (row < colInfo.lowestRow) colInfo.lowestRow = row;
        if (row > colInfo.highestRow) colInfo.highestRow = row;

        colInfo.tiles2Spawn++;
        this.tileRespawnPointer = { 
            row: this.height - colInfo.tiles2Spawn, 
            col,
        };
    }

    private _initInfoItem(
        col: number,
        stepRslInfo: StepResultByColsInfo,
    ) {
        const colInfo = stepRslInfo.colsInfo[col] || {
            tiles2Spawn: 0,
            highestRow: 0,
            lowestRow: this.height,
        };
        if (!stepRslInfo.colsInfo[col]) {
            stepRslInfo.colsInfo[col] = colInfo;
            stepRslInfo.colsIndex.push(col);
        }
        return colInfo;
    }
}