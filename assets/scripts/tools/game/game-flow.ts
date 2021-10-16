import { SceneSwitcher } from "../../controllers/scenes-switch/scene-switcher";
import { TileBase } from "../../controllers/tile-base";
import { Menu } from "../../controllers/ui/menu";
import { UI } from "../../controllers/ui/ui";
import { inject, injectable } from "../../decorators";
import { 
    IGameFlow, 
    IStepInspector, 
    ITile, 
    ITileSpawner, 
    LevelInfo, 
    StepResult 
} from "../../types";
import { Task } from "../common/task";

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

    isStepFinal(): boolean {
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
        const { tilesetVolToDstr } = this._lvlInfo.config;
        return hitTiles.length >= tilesetVolToDstr;
    }

    runStepResult(): void {
        const points = this.uiManager.points;
        const { targetScore, stepsAvail } = this._lvlInfo.config;
        if (points >= targetScore) this._completeLevel();
        else this._endGameIfLost(points, stepsAvail);
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
        const { stepsAvail } = this._lvlInfo.config;
        this.uiManager.stepsNum = stepsAvail;
        this.uiManager.reset();
    }

    private _completeLevel(): void {
        const { current, total } = this._lvlInfo.num;
        const result: StepResult = current === total - 1 ?
            'complete' : 'won';
        this._isStepFinal = true;
        this.menu.show(result);
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
            stepResult: 'lost' as StepResult,
            summary: { points, steps, },
        });
    }
}