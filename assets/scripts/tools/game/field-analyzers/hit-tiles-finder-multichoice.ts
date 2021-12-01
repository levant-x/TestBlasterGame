import { Booster } from "../../../controllers/booster";
import { injectable, injectValueByKey } from "../../../decorators";
import { 
    GridCellCoordinates, 
    ISupertile, 
    LevelConfig, 
} from "../../../types";
import { pickRandomItem } from "../../common/array-tools";
import { HitTilesFinderBase, ItemType } from "./hit-tiles-finder-base";
import { scanGrid, scanHoriz, scanVertical } from "./range-scanners.ts";

type T = ItemType;

@injectable('HitTilesFinderMultichoice')
export class HitTilesFinderMultichoice extends HitTilesFinderBase{
    private _startPointCrds: GridCellCoordinates;
    private _itemsGroup: T[];

    private sptileOutcomes = [
        () => this._applyBomb(),
        () => this._destroyRow(),            
        () => this._destroyCol(),
    ];

    @injectValueByKey('config')
    private _cfg: LevelConfig;

    protected runItemsCollect(
        crds: GridCellCoordinates,
        itemsGroup: T[]
    ): void {
        const currBooster = Booster.current?.type;
        this._startPointCrds = crds;
        this._itemsGroup = itemsGroup;

        if (currBooster === 'bomb') {
            this._applyBomb();
            return;
        }
        const { col, row } = crds;
        const tileAtStartPoint = this.gamefield[col][row];    
        const { isSuper } = tileAtStartPoint as unknown as ISupertile;

        if (isSuper) {
            this._applySupertile();
            return;
        }
        super.runItemsCollect(crds, itemsGroup);
    }

    private _applyBomb(): void {
        const r = this._cfg.bombExplRadius;
        const { y, x } = this._getStartPointCrds();

        const top = Math.min(y + r, this.height - 1);
        const bottom = Math.max(y - r, 0);
        const left = Math.max(x - r, 0);
        const right = Math.min(x + r, this.width - 1);

        scanGrid({ 
            left, right, }, { top, bottom, 
        }, this._collectItem.bind(this));
    }   

    private _applySupertile(): void {
        pickRandomItem(this.sptileOutcomes)();
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
        const tileAtPoint = this.gamefield[col][row];
        this._itemsGroup.push(tileAtPoint);
    }
}