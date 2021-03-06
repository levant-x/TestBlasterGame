import { Booster } from "../../../controllers/main/booster";
import { UI } from "../../../controllers/ui/ui";
import { inject, injectable } from "../../../decorators";
import { 
    IItemsGroupAnalyzer, 
    IStepInspector, 
    ITile, 
    LevelConfig, 
} from "../../../types";
import { GamefieldContext } from "./gamefield-context";

@injectable('StepInspector')
export class StepInspector implements IStepInspector {
    @inject('IItemsGroupAnalyzer')
    protected hitTilesFinder: IItemsGroupAnalyzer<ITile>;  

    isStepDeadEnd(
        levelInfo: LevelConfig,
        uiManager: UI,
    ): boolean {
        if (uiManager.stepsNum === 0) return true;

        const tilesMinVol = levelInfo.tilesetVolToDstr;
        const { totalLength } = GamefieldContext.calc;

        for (let i = 0; i < totalLength; i++) 
            if (this.isCellClickable(i, tilesMinVol)) return false;    
        return !this._tryShuffle();
    }

    protected isCellClickable(
        cellIndex: number,
        tilesMinVol: number,
    ): boolean {
        const col = GamefieldContext.calc.col(cellIndex);
        const row = GamefieldContext.calc.row(cellIndex);
        const { hitTilesFinder } = this;
        
        const collect = hitTilesFinder.collectItemsGroup.bind(hitTilesFinder);        
        const tilesGroupAtPoint = collect([{ row, col }]);
        return tilesGroupAtPoint.length >= tilesMinVol;
    }

    private _tryShuffle(): boolean {
        const hasAppliedShuffle = Booster.tryApply('shuffle');
        return hasAppliedShuffle;
    }
}