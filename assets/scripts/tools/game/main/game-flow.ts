import { SceneSwitcher } from "../../../controllers/scenes-switch/scene-switcher";
import { TileBase } from "../../../controllers/tile-base";
import { Menu } from "../../../controllers/ui/menu";
import { UI } from "../../../controllers/ui/ui";
import { inject, injectable } from "../../../decorators";
import { 
    IGameFlow, 
    IStepInspector, 
    ITile, 
    ITileSpawner, 
    LevelInfo, 
    StepResult 
} from "../../../types";
import { Task } from "../../common/task";

@injectable('GameFlow')
export class GameFlow implements IGameFlow {
    private _lvlInfo: LevelInfo;
    private _isStepFinal = false;

    @inject('ITileSpawner')
    protected tileSpawner: ITileSpawner;
    @inject('IStepInspector')
    protected stepInspector: IStepInspector;

    uiManager: UI;
    menu: Menu;

    get isStepFinal(): boolean {
        return this._isStepFinal;
    }

    setupGameStart(
        levelInfo: LevelInfo
    ): Task {
        if (!this.menu) throw 'Menu manager missing';
        if (!this.tileSpawner) throw 'Tile spawner missing';
        if (!this.uiManager) throw 'UI manager missing';

        this._lvlInfo = levelInfo;
        this._seedAnimateField();
        this._setupUI();

        const { menu } = this;
        const wireupModClose = menu.addModalCloseHandler.bind(menu);
        wireupModClose('won', this.switchLevel.bind(this));
        return new Task();
    }

    updateUI(
        pointsNum: number
    ): Task {
        if (!pointsNum) return new Task();

        this.uiManager.stepsNum--;
        return this.uiManager.gainPoints(pointsNum);
    }

    isStepValid(
        hitTiles: ITile[]
    ): boolean {
        const { tilesetVolToDstr } = this._lvlInfo;
        return hitTiles.length >= tilesetVolToDstr;
    }

    runStepResult(): void {
        const points = this.uiManager.value;
        const { targetScore, stepsTotal } = this._lvlInfo;
        if (points >= targetScore) this._completeLevel();
        else this._endGameIfLost(points, stepsTotal);
    }

    protected switchLevel() {
        SceneSwitcher.switchLevel();
    }

    private _seedAnimateField(): void {
        TileBase.is1stSeeding = true;
        this.tileSpawner.seedGamefield();
        TileBase.is1stSeeding = false;
    }

    private _setupUI(): void {
        this.uiManager.stepsNum = this._lvlInfo.stepsTotal;
        this.uiManager.targetScore = this._lvlInfo.targetScore;
        this.uiManager.reset();
    }

    private _completeLevel(): void {
        this._isStepFinal = true;
        this.menu.show(<StepResult>'won');
    }

    private _endGameIfLost(
        points: number,
        steps: number,
    ): void {
        const inspector = this.stepInspector;
        this._isStepFinal = inspector.isStepDeadEnd(this._lvlInfo,
            this.uiManager);
        if (!this._isStepFinal) return;

        this.menu.show({
            stepResult: <StepResult>'lost',
            summary: { points, steps, },
        });
    }
}