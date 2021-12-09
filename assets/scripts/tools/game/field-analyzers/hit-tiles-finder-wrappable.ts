import { GridCellCoordinates, IItemsGroupAnalyzer } from "../../../types";
import { 
    HitTilesFinderBase, 
    ItemSelector, 
    ItemType 
} from "./hit-tiles-finder-base";

type T = ItemType;
type Child = IItemsGroupAnalyzer<T>;

/**Intended to be nested with derivers to compose the desired set of gamefield
 * inspectors. !!!Can be created manually instead of injection
 */
export abstract class HitTilesFinderWrappable extends HitTilesFinderBase{
    private _child?: Child;

    constructor(child?: Child) {
        super();
        this._child = child;
    }

    collectItemsGroup(
        [crds]: GridCellCoordinates[], 
        select?: ItemSelector<T>
    ): T[] {
        this.initFlowState(crds);
        
        if (!this.canBeApplied && this._child) 
            return <T[]>this._child.collectItemsGroup([crds], select);        
        return super.collectItemsGroup([crds], select);
    }

    protected collectItem(
        { row, col, }: GridCellCoordinates,
    ): void {
        const tileAtPoint = this.gamefield[col][row];
        this.collectedItems.push(tileAtPoint);
    }

    protected abstract get canBeApplied(): boolean;
}