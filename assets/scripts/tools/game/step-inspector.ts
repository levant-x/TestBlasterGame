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
import { Task } from "../common/task";
import { TaskManager } from "../common/task-manager";
import { GamefieldContext } from "./gamefield-context";
import { HitTilesFinder } from "./hit-tiles-finder";

@injectable()
export class StepInspector implements IStepInspector {
    private _cbck: Function;

    @inject('HitTilesFinder')
    protected hitTilesFinder: HitTilesFinder;  
    @inject('IBoosterManager')
    protected boosterManager: IBoosterManager;
    @injectValueByKey('mainTasksManager')
    protected mainTasksMng: TaskManager;

    isStepDeadEnd = (
        levelInfo: LevelInfo,
        uiManager: UI,
        onCheckComplete: Function,
    ): boolean => {
        this._cbck = onCheckComplete;
        if (uiManager.stepsNum === 0) return true;

        const tilesMinVol = levelInfo.config.tilesetVolToDstr;
        const { totalLength } = GamefieldContext.get();
        for (let i = 0; i < totalLength; i++) 
            if (this.isCellClickable(i, tilesMinVol)) 
                return false;        
        this.boosterManager.onBoosterApply = this.onBoosterApply;
        const canShuffle = this._tryShuffle();
        return !canShuffle;
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

    protected onBoosterApply = (
        task: Task,
    ): void => {
        this.mainTasksMng.bundleWith(task, this._cbck);
    }

    private _tryShuffle(): boolean {
        this.boosterManager.applyBooster('shuffle');
        return !this.mainTasksMng.isComplete();
    }
}