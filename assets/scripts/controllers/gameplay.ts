
import { _decorator, Prefab } from 'cc';
import { GamefieldContext } from '../tools/gamefield-context';
import { HitTilesFinder } from '../tools/hit-tiles-finder';
import { Task, TaskManager } from '../tools/task';
import { TileOffsetter } from '../tools/tile-offsetter';
import { TileSpawner, TileSpawnerArgs } from '../tools/tile-spawner';
import { ToolsFactory } from '../tools/tools-factory';
import { 
    Demand4NewTilesInfo,
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
    protected hitTilesFinder?: HitTilesFinder;
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

        this.hitTilesFinder = ToolsFactory.get(HitTilesFinder);
        this.tileOffsetter = ToolsFactory.get(TileOffsetter);
        TileBase.onClick = this.onTileClick;
    }

    update() {
        this.taskMng.isComplete();
    }
        
    protected onTileSpawn = (newTile: ITile) => {
        const { col } = newTile.getCellCoordinates();
        if (this.gamefield.length < col + 1) this.gamefield.push([]);
        if (TileBase.is1stSeeding)
            this.gamefield[col].push(newTile);
        else this._replaceTileWithNewOne(newTile, col);
    }

    protected onTileClick = (sender: ITile) => {
        if (!this.taskMng.isComplete()) return;
        const senderCellCoords = sender.getCellCoordinates();   
        const find = this._getTilesAroundPoint;     
        const groupHit = find(senderCellCoords, sender);
        this.onGroupHitCollect(groupHit);
    }

    protected onGroupHitCollect(groupHit: IClassifyable[]) {
        const cfg = this.cfg as LevelConfig;
        if (groupHit.length < cfg.tilesetVolToDstr) return;    
        this.setupTask_DestroyHitTiles(groupHit as ITile[]);
        this.setupTask_OffsetLooseTiles(
            groupHit as ITile[]
        );
    }

    protected onLooseTilesOffset = () => {
        const hitTilesFinder = 
            this.hitTilesFinder as HitTilesFinder;
        const empCellsInfo = 
            hitTilesFinder.getEmptyCellsGroupedByColumn();
        const spawner = this.tileSpawner as TileSpawner;
        empCellsInfo.forEach(infoItem => 
            this.setupTask_SpawnNewTiles(
            infoItem, spawner)
        );
    }

    protected setupTask_DestroyHitTiles(groupHit: ITile[]) {
        const task = new Task();
        groupHit.forEach(tile => 
            task.bundleWith(tile.destroyHitAsync()));
        this.taskMng.bundleWith(task);
    }    

    protected setupTask_OffsetLooseTiles(
        groupHit: ITile[]
    ): void {
        const hitTilesCrds = groupHit
            .map(tileHit => tileHit.getCellCoordinates());
        const task = (this.tileOffsetter as TileOffsetter)
            .getTaskOffsetLooseTiles(hitTilesCrds);
        this.taskMng.bundleWith(
            task, this.onLooseTilesOffset
        );
    }

    protected setupTask_SpawnNewTiles = (
        demandInfo: Demand4NewTilesInfo,
        spawner: TileSpawner
    ): void => {
        if (!demandInfo.tiles2Spawn) return;
        const crds: GridCellCoordinates = {
            col: demandInfo.col,
            row: demandInfo.lowestRow,
        };
        demandInfo.tiles2Spawn--;
        demandInfo.lowestRow++;
        const cbck = () => this.setupTask_SpawnNewTiles(
            demandInfo, spawner
        );
        this.taskMng.bundleWith(spawner.spawnNewTile(
            crds, +this.height
        ), cbck);
    }

    private _getTilesAroundPoint = (
        { col, row }: GridCellCoordinates, trgTile: IClassifyable
    ) => {  
        const tilesFinder = 
            this.hitTilesFinder as HitTilesFinder;
        const selector = (other: IClassifyable) => (
            other.getGroupID() === trgTile.getGroupID()
        );
        return tilesFinder.collectItemsGroup([{
            col, row }], selector
        );
    }

    private _replaceTileWithNewOne(
        newTile: ITile, col: number
    ): void {
        const colItems = this.gamefield[col];
        const lowestEmptyCell = colItems.find(tile => !tile.isValid);
        if (!lowestEmptyCell) 
            throw 'Empty cell for new tile not found';
        const cellRow = colItems.indexOf(lowestEmptyCell);
        this.gamefield[col][cellRow] = newTile;
    }
}