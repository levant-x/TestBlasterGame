
import { _decorator, Prefab, Node } from 'cc';
import { inject, injectable } from '../../decorators';
import { dispatchValue } from '../../tools/common/di';
import { loadLevelInfoAsync } from '../../tools/common/load-level-info-task';
import { Task } from '../../tools/common/task';
import { TaskManager } from '../../tools/common/task-manager';
import { GamefieldContext } from '../../tools/game/main/gamefield-context';
import { IGameFlow, IStepFlow, ITile, ITileSpawner, LevelInfo, } from '../../types';
import { TileBase } from './tile-base';
import { Menu } from '../ui/menu';
import { UI } from '../ui/ui';
const { ccclass, property } = _decorator;

@ccclass('GameplayBase')
@injectable()
export abstract class GameplayBase extends GamefieldContext {
    protected taskMng = TaskManager.create();
    protected levelInfo: LevelInfo;
    protected updateUITask: Task;

    @property([Prefab])
    protected tilePrefabs: Prefab[] = [];
    @property(UI)
    protected uiMng: UI;
    @property(Menu)
    protected menu: Menu;
    @property(Node)
    protected mask: Node;

    @inject('IStepFlow')
    protected stepFlowMng: IStepFlow;
    @inject('IGameFlow')
    protected gameFlowMng: IGameFlow;
    @inject('ITileSpawner')
    protected tileSpawner: ITileSpawner;

    start() {
        const onCfgLoad = (lvlInfo: LevelInfo) => {
            this.levelInfo = lvlInfo;
            this.init();
        }
        const wait4ConfigTask = loadLevelInfoAsync(onCfgLoad);
        this.taskMng.bundleWith(wait4ConfigTask);
    }
        
    update() {
        this.taskMng.isComplete;
    }

    protected init() {
        this._setupCfgValues();
        this._setupTileSpawner();
        TileBase.onClick = this.onTileClick.bind(this); 
        
        this.gameFlowMng.menu = this.menu;   
        this.gameFlowMng.uiManager = this.uiMng;  
        this.gameFlowMng.setupGameStart(this.levelInfo);
    }

    protected onTileSpawn(
        newTile: ITile
    ): void {
        const { col } = newTile.сellCoordinates;
        if (this.gamefield.length < col + 1) this.gamefield.push([]);
        if (TileBase.is1stSeeding) this.gamefield[col].push(newTile);
        else this._replaceHitTileWithNew(newTile, col);
    }

    protected onTileClick(
        sender: ITile
    ): void {
        if (!this.isStepPossible()) return;
        const hitTiles = this.stepFlowMng.detectHitTiles(sender);
        this.onHitTilesDetect(hitTiles);
    }    

    protected isStepPossible(): boolean {
        return this.taskMng.isComplete;
    }

    protected onHitTilesDetect(
        hitTiles: ITile[]
    ): void {
        if (!this.gameFlowMng.isStepValid(hitTiles)) return; 
        const destroyTilesTask = this.stepFlowMng.destroyHitTilesAsync(hitTiles);
        const onDestroy = this.onHitTilesDestroy.bind(this);

        this.taskMng.bundleWith(destroyTilesTask, onDestroy);            
        const pointsNum = hitTiles.length;
        this.updateUITask = this.gameFlowMng.updateUI(pointsNum);
    }

    protected onHitTilesDestroy() {
        const offsetTask = this.stepFlowMng.offsetLooseTilesAsync();  
        const respawnTask = this.stepFlowMng.spawnNewTilesAsync();  
        const bundle = this.taskMng.bundleWith.bind(this.taskMng);

        bundle(offsetTask);
        bundle(respawnTask, this.onLooseTilesOffset.bind(this));
    }

    protected onLooseTilesOffset() {
        const updUITask = this.updateUITask;
        const onStepEnd = this.onStepEnd.bind(this);
        this.taskMng.bundleWith(updUITask, onStepEnd);
    }

    /**Checks step result by default */
    protected onStepEnd() {
        this.gameFlowMng.runStepResult();    
    }

    private _replaceHitTileWithNew(
        newTile: ITile, 
        col: number
    ): void {        
        const row = this.getIileRespawnPointer(col);        
        this.gamefield[col][row] = newTile;
        this.tileRespawnPointer = { col, row: row + 1 };
    } 

    private _setupCfgValues(): void {
        const config = this.levelInfo;     
        dispatchValue('fieldHeight', config.fieldHeight);
        dispatchValue('config', config);
        this.initContext(config);
    }

    private _setupTileSpawner(): void {
        this.tileSpawner.colsNum = this.width;
        this.tileSpawner.rowsNum = this.height;

        this.tileSpawner.prefabs = this.tilePrefabs;
        this.tileSpawner.targetNode = this.mask;
        this.tileSpawner.onTileSpawn = this.onTileSpawn.bind(this);
    }
}