
import { _decorator, Prefab, Camera, color } from 'cc';
import { CONFIG } from '../config';
import { inject, injectable } from '../decorators';
import { resolveValue } from '../tools/common/di';
import { Task } from '../tools/common/task';
import { TaskManager } from '../tools/common/task-manager';
import { GamefieldContext } from '../tools/game/gamefield-context';
import { 
    IGameFlow,
    IStepFlow, 
    ITile, 
    ITileSpawner,
    LevelInfo, 
} from '../types';
import { ConfigStore } from './scenes-switch/config-store';
import { TileBase } from './tile-base';
import { Menu } from './ui/menu';
import { UI } from './ui/ui';
const { ccclass, property } = _decorator;

@ccclass('GameplayBase')
@injectable()
export abstract class GameplayBase extends GamefieldContext {
    protected taskMng = TaskManager.create();
    protected info: LevelInfo = ConfigStore.getConfig();    
    protected updateUITask?: Task;

    @property([Prefab])
    protected tilePrefabs: Prefab[] = [];
    @property(UI)
    protected uiMng?: UI;
    @property(Menu)
    protected menu?: Menu;

    @inject('IStepFlow')
    protected stepFlowMng: IStepFlow;
    @inject('IGameFlow')
    protected gameFlowMng: IGameFlow;
    @inject('ITileSpawner')
    protected tileSpawner: ITileSpawner;

    start () {
        const { config } = this.info;
        this.initContext(config);
        const { fieldHeight } = CONFIG.VALUE_KEYS;
        resolveValue(fieldHeight, config.fieldHeight);

        this.tileSpawner.colsNum = this.witdh;
        this.tileSpawner.rowsNum = this.height;
        this.tileSpawner.prefabs = this.tilePrefabs;
        this.tileSpawner.targetNode = this.node;
        this.tileSpawner.onTileSpawn = this.onTileSpawn;

        TileBase.onClick = this.onTileClick;   
        this.gameFlowMng.menu = this.menu as Menu;   
        this.gameFlowMng.uiManager = this.uiMng as UI;          
        this.gameFlowMng.setupGameStart(this.info);
    }
        
    update() {
        this.taskMng.isComplete();
    }

    protected onTileSpawn = (
        newTile: ITile
    ): void => {
        const { col } = newTile.getCellCoordinates();
        if (this.gamefield.length < col + 1) this.gamefield.push([]);
        if (TileBase.is1stSeeding) this.gamefield[col].push(newTile);
        else this._replaceHitTileWithNew(newTile, col);
    }

    protected onTileClick = (
        sender: ITile
    ): void => {
        if (!this.taskMng.isComplete()) return;
        const detectTiles = this.stepFlowMng.detectHitTiles;
        const hitTiles = detectTiles(sender);
        this.onHitTilesDetect(hitTiles);
    }    

    protected onHitTilesDetect = (
        hitTiles: ITile[]
    ): void => {
        if (!this.gameFlowMng.isStepValid(hitTiles)) return; 
        this.taskMng.bundleWith(this.stepFlowMng
            .destroyHitTiles(hitTiles), this.onHitTilesDestroy);
        const pointsNum = hitTiles.length;
        this.updateUITask = this.gameFlowMng.updateUI(pointsNum);
    }

    protected onHitTilesDestroy = () => {
        const offsetTask = this.stepFlowMng.offsetLooseTiles();
        this.taskMng.bundleWith(offsetTask, this.onLooseTilesOffset);
    }

    protected onLooseTilesOffset = () => {
        const respawnTask = this.stepFlowMng.spawnNewTiles();
        const stepResultCheck = this.gameFlowMng.runStepResult;
        this.taskMng.bundleWith(respawnTask)
            .bundleWith(this.updateUITask as Task, stepResultCheck);
    }

    private _replaceHitTileWithNew(
        newTile: ITile, col: number
    ): void {
        const colItems = this.gamefield[col];
        const lowestEmptyCell = colItems.find(tile => !tile.isValid);
        if (!lowestEmptyCell) throw 'Excessive tile spawned';
        const rowIndex = colItems.indexOf(lowestEmptyCell);
        this.gamefield[col][rowIndex] = newTile;
    } 
}