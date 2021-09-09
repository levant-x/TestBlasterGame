
import { _decorator, Node, Prefab } from 'cc';
import { TaskManager } from '../tools/common/task-manager';
import { GamefieldContext } from '../tools/gamefield-context';
import { HitTilesFinder } from '../tools/hit-tiles-finder';
import { TileOffsetter } from '../tools/tile-offsetter';
import { TileSpawner, TileSpawnerArgs } from '../tools/tile-spawner';
import { ToolsFactory } from '../tools/tools-factory';
import { 
    GridCellCoordinates, 
    IClassifyable, 
    ITile, 
    LevelConfig 
} from '../types';
import { TileBase } from './tile-base';
import { Menu } from './ui/menu';
import { UI } from './ui/ui';
const { ccclass, property } = _decorator;

@ccclass('Gameplay-base')
export abstract class GameplayBase extends GamefieldContext {
    private _toolsInitializer = new ToolsFactory();

    protected taskMng = TaskManager.create();
    protected static currLevel = 0;
    protected cfg?: LevelConfig;
    protected tileSpawner?: TileSpawner;
    protected hitTilesFinder?: HitTilesFinder;
    protected tileOffsetter?: TileOffsetter;
    protected hitTiles: ITile[] = [];
    
    @property(Node)
    protected fieldNode?: Node;
    @property([Prefab])
    protected tilePrefabs: Prefab[] = [];
    @property(UI)
    protected uiMng?: UI;
    @property(Menu)
    protected menu?: Menu;

    async start () {
        await this._loadCfgAsync();
        this._initFieldCtx(this.cfg as LevelConfig);        
        // AFTER CONFIG INIT
        this.tileSpawner = ToolsFactory.get(TileSpawner, {
            rows: this.height,
            cols: this.witdh,
            fieldNode: this.fieldNode as Node,
            prefabs: this.tilePrefabs,
        } as TileSpawnerArgs);
        this.hitTilesFinder = ToolsFactory.get(HitTilesFinder);
        this.tileOffsetter = ToolsFactory.get(TileOffsetter);
        this._setupLvl(this.tileSpawner);
        this.setupTask_UpdateProgress();
        (this.menu as Menu).onHide = () => {
            console.log('LOADING NACHSTES SCENE');
            
        }
         
    }
        
    update() {
        this.taskMng.isComplete();
    }

    protected abstract onTileSpawn(newTile: ITile): void;

    protected onTileClick = (
        sender: ITile
    ) => {
        if (!this.taskMng.isComplete()) return;
        const senderCellCoords = sender.getCellCoordinates();   
        const hitTiles = this.getHitTiles(senderCellCoords, sender);     
        this.onHitTilesDetect(hitTiles);
    }    

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

    protected abstract setupTask_UpdateProgress(): void;

    protected abstract setupTask_OffsetLooseTiles(): void;

    protected abstract check4GameFinish(): void;

    private async _loadCfgAsync() {
        this.cfg = await 
            this._toolsInitializer.loadLevelConfigAsync(
            GameplayBase.currLevel
        );
    }

    private _initFieldCtx(cfg: LevelConfig) {
        this.initCtx({
            gamefield: [],
            w: cfg.fieldWidth,
            h: cfg.fieldHeight,
        });
    }

    private _setupLvl(
        tileSpawner: TileSpawner
    ): void {
        TileBase.is1stSeeding = true;
        tileSpawner.seedGamefield(this.onTileSpawn);
        TileBase.is1stSeeding = false;
        TileBase.onClick = this.onTileClick;
    }
}