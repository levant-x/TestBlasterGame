import { UI } from "../../controllers/ui/ui";
import { inject, injectable } from "../../decorators";
import { 
    IBoosterManager, 
    IItemsGroupAnalyzer, 
    IStepInspector, 
    ITile, 
    LevelInfo, 
} from "../../types";
import { GamefieldContext } from "./gamefield-context";

@injectable('StepInspector')
export class StepInspector implements IStepInspector {
    @inject('IItemsGroupAnalyzer')
    protected hitTilesFinder: IItemsGroupAnalyzer<ITile>;  
    @inject('IBoosterManager')
    protected boosterManager: IBoosterManager;

    isStepDeadEnd(
        levelInfo: LevelInfo,
        uiManager: UI,
    ): boolean {
        if (uiManager.stepsNum === 0) return true;

        const tilesMinVol = levelInfo.config.tilesetVolToDstr;
        const { totalLength } = GamefieldContext.get();

        for (let i = 0; i < totalLength; i++) 
            if (this.isCellClickable(i, tilesMinVol)) return false;    
        return !this._tryShuffle();
    }

    protected isCellClickable(
        cellIndex: number,
        tilesMinVol: number,
    ): boolean {
        const col = GamefieldContext.get().col(cellIndex);
        const row = GamefieldContext.get().row(cellIndex);
        const { hitTilesFinder } = this;
        
        const collect = hitTilesFinder.collectItemsGroup.bind(hitTilesFinder);        
        const tilesGroupAtPoint = collect([{ row, col }]);
        return tilesGroupAtPoint.length >= tilesMinVol;
    }

    private _tryShuffle(): boolean {
        const mng = this.boosterManager;
        const applyBooster = mng.tryApplyBooster.bind(mng);
        const hasAppliedShuffle = applyBooster('shuffle');
        return hasAppliedShuffle;
    }
}