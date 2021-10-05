import { inject, injectable, injectValueByKey } from "../../../decorators";
import { 
    GridCellCoordinates, 
    IBoostNotifier, 
    LevelConfig 
} from "../../../types";
import { HitTilesFinderBase, ItemType } from "./hit-tiles-finder-base";
import { scanGrid } from "./range-scanners.ts";

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
        this._boostNotifier.dropBoosterStatus();
    }

    private _applyBomb(): void {
        debugger
        const r = this._cfg.bombExplRadius;
        const { 
            row: centerY, 
            col: centerX,
        } = this._startPointCrds;

        const top = Math.min(centerY + r, this.height - 1);
        const bottom = Math.max(centerY - r, 0);
        const left = Math.max(centerX - r, 0);
        const right = Math.min(centerX + r, this.witdh - 1);

        scanGrid({ 
            left, right, }, { top, bottom, 
        }, ({ row, col, }) => {
            this._itemsGroup.push(this.gamefield[col][row]);
        });
    }
}