
import { _decorator, Prefab } from 'cc';
import { GamefieldContext } from '../tools/gamefield-context';
import { HitTilesFinder } from '../tools/hit-tiles-finder';
import { LooseTilesFinder } from '../tools/loose-tiles-finder';
import { Task, TaskManager } from '../tools/task';
import { TileOffsetter } from '../tools/tile-offsetter';
import { TileSpawner, TileSpawnerArgs } from '../tools/tile-spawner';
import { ToolsFactory } from '../tools/tools-factory';
import { 
    EmptyCellsCount, 
    GridCellCoordinates, 
    IClassifyable, 
    ITile, 
    LevelConfig 
} from '../types';
import { TileBase } from './tile-base';
const { ccclass, property } = _decorator;

@ccclass('Gameplay')
export class Gameplay extends GamefieldContext {
    private _toolsInitializer = new ToolsFactory();

    protected taskMng = TaskManager.create();
    protected curLevel = 0;
    protected cfg?: LevelConfig;
    protected tileSpawner?: TileSpawner;
    protected hitTilesCollector?: HitTilesFinder;
    protected tileOffsetter?: TileOffsetter;

    @property({ type: [Prefab] })
    private tilePrefabs: Prefab[] = [];

    async start () {
        this.cfg = await this._toolsInitializer.loadLevelConfigAsync(
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

        this.hitTilesCollector = ToolsFactory.get(HitTilesFinder);
        this.tileOffsetter = ToolsFactory.get(TileOffsetter);
        TileBase.onClick = this.onTileClick;
    }

    update() {
        this.taskMng.runCurrent();
    }
        
    protected onTileSpawn = (tileLogic: ITile) => {
        const { col } = tileLogic.getCellCoordinates();
        if (this.gamefield.length < col + 1) this.gamefield.push([]);
        this.gamefield[col].push(tileLogic);
    }

    protected onTileClick = (sender: ITile) => {
        if (!this.taskMng.isComplete()) return;
        const senderCellCoords = sender.getCellCoordinates();   
        const action = this._getTilesAroundPoint;     
        const groupHit = action(senderCellCoords, sender);
        this.onGroupHitCollect(groupHit);
    }

    protected onGroupHitCollect(groupHit: IClassifyable[]) {
        const cfg = this.cfg as LevelConfig;
        if (groupHit.length < cfg.tilesetVolToDstr) return;    
        this.destroyHitTilesAsync(groupHit as ITile[]);
        this.setupTask_OffsetLooseTiles(groupHit as ITile[]);
    }

    protected onLooseTilesOffset() {
        // will be spawned new ones
    }

    protected destroyHitTilesAsync(groupHit: ITile[]) {
        groupHit.forEach(tile => tile.destroyHitAsync());
    }

    protected setupTask_OffsetLooseTiles(
        groupHit: ITile[]
    ) {
        const hitTilesCrds = groupHit
            .map(tileHit => tileHit.getCellCoordinates());
        const task = (this.tileOffsetter as TileOffsetter)
            .getTaskOffsetLooseTiles(hitTilesCrds);
        this.taskMng.setTask(
            task, this.onLooseTilesOffset
        );
    }

    private _getTilesAroundPoint = (
        { col, row }: GridCellCoordinates, trgTile: IClassifyable
    ) => {  
        const tilesFinder = 
            this.hitTilesCollector as HitTilesFinder;
        const callback = (other: IClassifyable) => (
            other.getGroupID() === trgTile.getGroupID()
        );
        return tilesFinder.collectItemsGroup([{
            col, row }], callback
        );
    }
}