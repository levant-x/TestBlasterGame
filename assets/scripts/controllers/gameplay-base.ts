
import { _decorator, Prefab } from 'cc';
import { CONFIG, LOADER_SCENE_NAME } from '../config';
import { TaskManager } from '../tools/common/task-manager';
import { GamefieldContext } from '../tools/gamefield-context';
import { HitTilesFinder } from '../tools/hit-tiles-finder';
import { TileOffsetter } from '../tools/tile-offsetter';
import { TileSpawner, TileSpawnerArgs } from '../tools/tile-spawner';
import { 
    GridCellCoordinates, 
    IClassifyable, 
    ITile, 
    LevelConfig 
} from '../types';
import { ConfigStore } from './scenes-switch/config-store';
import { SceneSwitcher } from './scenes-switch/scene-switcher';
import { TileBase } from './tile-base';
import { Menu } from './ui/menu';
import { UI } from './ui/ui';
const { ccclass, property } = _decorator;

@ccclass('Gameplay-base')
export abstract class GameplayBase extends GamefieldContext {
    protected taskMng = TaskManager.create();
    protected cfg = ConfigStore.getConfig();
    protected tileSpawner?: TileSpawner;
    protected hitTilesFinder = CONFIG.get(HitTilesFinder);
    protected tileOffsetter = CONFIG.get(TileOffsetter);
    protected hitTiles: ITile[] = [];

    @property([Prefab])
    protected tilePrefabs: Prefab[] = [];
    @property(UI)
    protected uiMng?: UI;
    @property(Menu)
    protected menu?: Menu;

    start () {
        this.initContext(this.cfg);
        // AFTER CONTEXT INIT
        this.tileSpawner = CONFIG.get(TileSpawner, {
            fieldNode: this.node,
            prefabs: this.tilePrefabs as Prefab[],
            ...this.cfg
        } as TileSpawnerArgs);
        this._setupLvl(this.tileSpawner);
        this.setupTask_UpdateProgress();
        const { addCloseEventHandler } = (this.menu as Menu);
        addCloseEventHandler('win', this.switchLevel);
    }
        
    update() {
        this.taskMng.isComplete();
    }

    protected onTileClick = (
        sender: ITile
    ) => {
        if (!this.taskMng.isComplete()) return;
        const senderCellCoords = sender.getCellCoordinates();   
        const hitTiles = this.getHitTiles(senderCellCoords, sender);     
        this.onHitTilesDetect(hitTiles);
    }    

    protected abstract onTileSpawn(newTile: ITile): void;

    protected abstract getHitTiles(
        clickedCellCoords: GridCellCoordinates,
        targetType: IClassifyable,
    ): ITile[];

    protected onHitTilesDetect(hitTiles: ITile[]) {
        this.hitTiles = hitTiles;
        if (!this.isStepValid(this.cfg as LevelConfig)) return;  
        this.setupTask_DestroyHitTiles();
    }

    protected abstract isStepValid(config: LevelConfig): boolean;

    protected abstract setupTask_DestroyHitTiles(): void;

    protected abstract setupTask_OffsetLooseTiles(): void;

    protected abstract setupTask_UpdateProgress(): void;

    protected abstract check4GameFinish(): void;

    protected switchLevel = () => {
        SceneSwitcher.switchLevel(LOADER_SCENE_NAME);
    }

    private _setupLvl = (
        tileSpawner: TileSpawner
    ): void => {
        TileBase.is1stSeeding = true;
        tileSpawner.seedGamefield(this.onTileSpawn);
        TileBase.is1stSeeding = false;
        TileBase.onClick = this.onTileClick;
    }
}