import { Booster } from "../../../../controllers/booster";
import { LevelConfig } from "../../../../types";
import { HitTilesFinderWrappable } from "../hit-tiles-finder-wrappable";
import { scanGrid } from "../range-scanners.ts";

export class Bomb extends HitTilesFinderWrappable {
    public config: LevelConfig;

    protected get canBeApplied(): boolean {
        const currBooster = Booster.current?.type;
        return currBooster === 'bomb';
    }

    protected runItemsCollect(): void {
        this.applyBomb();
    }

    protected applyBomb(): void {
        const r = this.config.bombExplRadius;
        const { y, x } = this.wrapStartPointCoords();

        const top = Math.min(y + r, this.height - 1);
        const bottom = Math.max(y - r, 0);
        const left = Math.max(x - r, 0);
        const right = Math.min(x + r, this.width - 1);

        scanGrid({ 
            left, right, }, { top, bottom, 
        }, this.collectItem.bind(this));
    } 

    protected wrapStartPointCoords() {
        const { row, col } = this.startItem.сellCoordinates;
        return { x: col, y: row };
    }
}