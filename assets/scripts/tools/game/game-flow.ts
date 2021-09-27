import { CONFIG } from "../../config";
import { SceneSwitcher } from "../../controllers/scenes-switch/scene-switcher";
import { TileBase } from "../../controllers/tile-base";
import { Menu } from "../../controllers/ui/menu";
import { UI } from "../../controllers/ui/ui";
import { inject, injectable } from "../../decorators";
import { 
    IGameFlow, 
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
    tileSpawner: ITileSpawner;
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

        const { addModalCloseHandler } = this.menu as Menu;
        addModalCloseHandler('won', this.switchLevel);
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

    runStepResult = (): StepResult => {
        const points = this.uiManager.getPoints();
        const { targetScore } = this._lvlInfo.config;
        let result: StepResult = 
            points >= targetScore ? 'won' :
            this.uiManager.stepsNum === 0 ? 'over' : 'next';  
        const { current, total } = this._lvlInfo.num;
        if (result === 'won' && current === total - 1)
            result = 'complete';
        if (result !== 'next') this.menu.show(result);
        return result;
    }

    protected switchLevel = () => {
        SceneSwitcher.switchLevel(CONFIG.LOADER_SCENE_NAME);
    }
}