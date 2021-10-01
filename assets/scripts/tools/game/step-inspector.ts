import { UI } from "../../controllers/ui/ui";
import { 
    inject, 
    injectable, 
    injectValueByKey 
} from "../../decorators";
import { 
    IBoosterManager, 
    IStepInspector, 
    LevelInfo 
} from "../../types";
import { TaskManager } from "../common/task-manager";
import { GamefieldContext } from "./gamefield-context";
import { HitTilesFinder } from "./hit-tiles-finder";

@injectable()
export class StepInspector implements IStepInspector {
    @inject('HitTilesFinder')
    protected hitTilesFinder: HitTilesFinder;  
    @inject('IBoosterManager')
    protected boosterManager: IBoosterManager;

    isStepDeadEnd = (
        levelInfo: LevelInfo,
        uiManager: UI,
    ): boolean => {
        if (uiManager.stepsNum === 0) return true;

        const tilesMinVol = levelInfo.config.tilesetVolToDstr;
        const { totalLength } = GamefieldContext.get();
        for (let i = 0; i < totalLength; i++) 
            if (this.isCellClickable(i, tilesMinVol)) 
                return false;        
        const hasAppliedShuffle = this._tryShuffle();
        return !hasAppliedShuffle;
    }

    protected isCellClickable(
        cellIndex: number,
        tilesMinVol: number,
    ): boolean {
        const col = GamefieldContext.get().col(cellIndex);
        const row = GamefieldContext.get().row(cellIndex);
        const collect = this.hitTilesFinder.collectItemsGroup;        
        const tilesGroupAtPoint = collect([{ row, col }]);
        return tilesGroupAtPoint.length >= tilesMinVol;
    }

    private _tryShuffle(): boolean {
        const apply = this.boosterManager.tryApplyBooster;
        const hasAppliedShuffle = apply('shuffle');
        return hasAppliedShuffle;
    }
}