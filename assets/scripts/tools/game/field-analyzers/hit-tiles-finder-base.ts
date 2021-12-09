import { 
    StepResultByColsInfo, 
    GridCellCoordinates, 
    IClassifyable, 
    IItemsGapAnalyzer, 
    IItemsGroupAnalyzer,
    ITile,
    ILocatable2D,
} from '../../../types';
import { injectable } from '../../../decorators';
import { GamefieldContext } from '../gamefield-context';

type GCCAlias = GridCellCoordinates;
type GCSwitcher = (coords: GCCAlias) => GCCAlias;
type T = IClassifyable & ILocatable2D;

export type ItemType = T;
export type ItemSelector<T> = (item: T) => boolean;

@injectable('HitTilesFinderBase')
export class HitTilesFinderBase extends GamefieldContext 
    implements IItemsGroupAnalyzer<T, T>, IItemsGapAnalyzer {

    private _selectItem: ItemSelector<T>;
    private _lookedUpCellsIndexes: number[];
    private _coordsSearchSwitchers: GCSwitcher[] = [
        coords => ({...coords, col: coords.col + 1}),
        coords => ({...coords, col: coords.col - 1}),
        coords => ({...coords, row: coords.row + 1}),
        coords => ({...coords, row: coords.row - 1}),
    ];

    protected startItem: T;
    protected collectedItems: T[];

    collectItemsGroup(
        [startPointCoords]: GridCellCoordinates[], 
        select?: ItemSelector<T>
    ): T[] {
        this.initFlowState(startPointCoords);
        const itemSelector = select || ((otherItem: T) => 
            this.startItem.groupID === otherItem.groupID);
        this._selectItem = itemSelector;

        const startItemIndex = 
            GamefieldContext.get.linear(startPointCoords);
        this._lookedUpCellsIndexes = [startItemIndex];

        this.runItemsCollect(startPointCoords);
        return this.collectedItems;
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

    protected initFlowState(
        { row, col }: GridCellCoordinates
    ): void {
        this.collectedItems = [];  
        this.startItem = this.gamefield[col][row];
    }

    /**Collects items the normal wave way */
    protected runItemsCollect(
        crds: GCCAlias, 
    ): void {
        this._collectItems(crds);
    }

    private _collectItems(
        crds: GCCAlias, 
    ): void {
        const { row, col } = crds;
        const itemAtPoint = <T>this.gamefield[col][row];  

        const itemFits = this._selectItem(itemAtPoint);
        if (itemFits) this.collectedItems.push(itemAtPoint);
        else return;

        for (const offset of this._coordsSearchSwitchers) {
            const newCrds = offset(crds);
            
            if (!this._toUseOffset(newCrds)) continue;            
            this._collectItems(newCrds);
        }
    }

    private _toUseOffset(
        crds: GCCAlias
    ): boolean {
        if (!this._areGridCellCoordsValid(crds)) return false;

        const cellIndex = GamefieldContext.get.linear(crds);
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