
import { _decorator, Prefab } from 'cc';
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
import { UI } from './ui';
const { ccclass, property } = _decorator;

@ccclass('Gameplay-base')
export abstract class GameplayBase extends GamefieldContext {
    private _toolsInitializer = new ToolsFactory();

    protected taskMng = TaskManager.create();
    protected curLevel = 0;
    protected cfg?: LevelConfig;
    protected tileSpawner?: TileSpawner;
    protected hitTilesFinder?: HitTilesFinder;
    protected tileOffsetter?: TileOffsetter;
    protected hitTiles: ITile[] = [];
    
    @property({ type: [Prefab] })
    private tilePrefabs: Prefab[] = [];
    @property({ type: UI })
    uiMng?: UI;

    async start () {
        this.cfg = await 
            this._toolsInitializer.loadLevelConfigAsync(
            this.curLevel
        );
        this.initCtx({
            gamefield: [],
            w: this.cfg.fieldWidth,
            h: this.cfg.fieldHeight,
        });
        // AFTER CONFIG INIT
        this.tileSpawner = ToolsFactory.get(TileSpawner, {
            rows: this.height,
            cols: this.witdh,
            fieldNode: this.node,
            prefabs: this.tilePrefabs,
        } as TileSpawnerArgs);
        
        TileBase.is1stSeeding = true;
        this.tileSpawner.seedGamefield(this.onTileSpawn);
        TileBase.is1stSeeding = false;

        this.hitTilesFinder = ToolsFactory.get(HitTilesFinder);
        this.tileOffsetter = ToolsFactory.get(TileOffsetter);
        TileBase.onClick = this.onTileClick;
        this.setupTask_UpdateProgress();
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
}