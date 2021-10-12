import { inject, injectable, injectValueByKey } from "../../../decorators";
import { 
    GridCellCoordinates, 
    IBoostNotifier, 
    LevelConfig 
} from "../../../types";
import { pickRandomItem } from "../../common/array-tools";
import { HitTilesFinderBase, ItemType } from "./hit-tiles-finder-base";
import { scanGrid, scanHoriz, scanVertical } from "./range-scanners.ts";

type T = ItemType;

@injectable()
export class HitTilesFinderMultichoice extends HitTilesFinderBase{
    private _startPointCrds: GridCellCoordinates;
    private _itemsGroup: T[];

    @inject('IBoostNotifier')
    private _boostNotifier: IBoostNotifier;
    @injectValueByKey('config')
    private _cfg: LevelConfig;

    protected runItemsCollect(
        crds: GridCellCoordinates,
        itemsGroup: T[]
    ): void {
        const currBooster = 
            this._boostNotifier.getCurrentBooster();
        if (!currBooster) {
            super.runItemsCollect(crds, itemsGroup);
            return;
        }

        this._startPointCrds = crds;
        this._itemsGroup = itemsGroup;
        currBooster === 'bomb' && this._applyBomb();
        currBooster === 'supertile' && this._applySupertile();
    }

    private _applyBomb(): void {
        const r = this._cfg.bombExplRadius;
        const { y, x, } = this._getStartPointCrds();

        const top = Math.min(y + r, this.height - 1);
        const bottom = Math.max(y - r, 0);
        const left = Math.max(x - r, 0);
        const right = Math.min(x + r, this.width - 1);

        scanGrid({ 
            left, right, }, { top, bottom, 
        }, this._collectItem.bind(this));
    }   

    private _applySupertile(): void {
        pickRandomItem([
            () => this._applyBomb(),
            () => this._destroyRow(),            
            () => this._destroyCol(),
        ])();
    }

    private _destroyRow(): void {
        const { y } = this._getStartPointCrds();
        scanHoriz({
            left: 0, 
            right: this.width - 1,
        }, col => this._collectItem.bind(this)({
            row: y, col,
        }));
    }

    private _destroyCol(): void {
        const { x } = this._getStartPointCrds();
        scanVertical({
            bottom: 0, 
            top: this.height - 1,
        }, row => this._collectItem.bind(this)({
            row, col: x,
        }));
    }

    private _getStartPointCrds = () => ({
        x: this._startPointCrds.col, 
        y: this._startPointCrds.row,
    })

    private _collectItem(
        { row, col, }: GridCellCoordinates,
    ): void {
        this._itemsGroup.push(this.gamefield[col][row]);
    }
}