import { CONFIG } from "../../config";
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

@injectable()
export class GameFlow implements IGameFlow {
    private _lvlInfo: LevelInfo;

    @inject('ITileSpawner')
    protected tileSpawner: ITileSpawner;
    @inject('IStepInspector')
    protected stepInspector: IStepInspector;

    uiManager: UI;
    menu: Menu;

    setupGameStart(
        levelInfo: LevelInfo
    ): Task {
        if (!this.menu) throw 'Menu manager missing';
        if (!this.tileSpawner) throw 'Tile spawner missing';
        if (!this.uiManager) throw 'UI manager missing';

        this._lvlInfo = levelInfo;
        TileBase.is1stSeeding = true;
        this.tileSpawner.seedGamefield();
        TileBase.is1stSeeding = false;

        const { stepsAvail } = levelInfo.config;
        this.uiManager.stepsNum = stepsAvail;
        this.uiManager.reset();

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
        const points = this.uiManager.getPoints();
        const { targetScore, stepsAvail } = this._lvlInfo.config;
        const { current, total } = this._lvlInfo.num;
        let result: StepResult = 'next';
        
        if (points >= targetScore) {
            result = current === total - 1 ?
                'complete' : 'won';
            this.menu.show(result);
            return;
        }
        this._endGameIfLost(points, stepsAvail);
    }

    private _endGameIfLost(
        points: number,
        steps: number,
    ): void {
        const inspector = this.stepInspector;
        const isStepFinite = inspector.isStepDeadEnd.bind(inspector);
        if (isStepFinite(this._lvlInfo, this.uiManager)) {
            this.menu.show({
                stepResult: 'lost' as StepResult,
                summary: { points, steps, },
            });
            return;
        }
    }

    protected switchLevel() {
        SceneSwitcher.switchLevel(CONFIG.LOADER_SCENE_NAME);
    }
}