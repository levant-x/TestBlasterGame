import { ISupertile } from "../../../../types";
import { pickRandomItem } from "../../../common/array-tools";
import { scanHoriz, scanVertical } from "../range-scanners.ts";
import { Bomb } from "./bomb";

export class Supertile extends Bomb {
    private sptileOutcomes = [
        () => this.applyBomb(),
        () => this._destroyRow(),            
        () => this._destroyCol(),
    ];

    protected get canBeApplied(): boolean {
        if (!this.startItem) return false;

        const { col, row } = this.startItem.сellCoordinates;
        const tileAtStartPoint = this.gamefield[col][row];    
        const { isSuper } = tileAtStartPoint as unknown as ISupertile;
        return isSuper;
    }

    protected runItemsCollect(): void {
        pickRandomItem(this.sptileOutcomes)();
    }

    private _destroyRow(): void {
        const { y } = this.wrapStartPointCoords();
        scanHoriz({
            left: 0, 
            right: this.width - 1,
        }, col => this.collectItem.bind(this)({
            row: y, col,
        }));
    }

    private _destroyCol(): void {
        const { x } = this.wrapStartPointCoords();
        scanVertical({
            bottom: 0, 
            top: this.height - 1,
        }, row => this.collectItem.bind(this)({
            row, col: x,
        }));
    }
}