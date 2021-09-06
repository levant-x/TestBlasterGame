
import { _decorator } from 'cc';
import { HitTilesFinder } from '../tools/hit-tiles-finder';
import { Task } from '../tools/common/task';
import { TileOffsetter } from '../tools/tile-offsetter';
import { TileSpawner } from '../tools/tile-spawner';
import { 
    Demand4NewTilesInfo,
    GridCellCoordinates, 
    IClassifyable, 
    ITile,
    LevelConfig, 
} from '../types';
import { GameplayBase } from './gameplay-base';
import { TileBase } from './tile-base';
const { ccclass } = _decorator;

@ccclass('Gameplay')
export class Gameplay extends GameplayBase {  
    private _hitTilesCrds: GridCellCoordinates[] = [];
    
    protected onTileSpawn = (
        newTile: ITile
    ): void => {
        const { col } = newTile.getCellCoordinates();
        if (this.gamefield.length < col + 1) this.gamefield.push([]);
        if (TileBase.is1stSeeding) this.gamefield[col].push(newTile);
        else this._replaceTileWithNewOne(newTile, col);
    }

    protected isStepValid (
        config: LevelConfig
    ): boolean {
        const { length } = this.hitTiles;
        return length >= config.tilesetVolToDstr;
    }

    protected getHitTiles(
        clickedCellCoords: GridCellCoordinates, 
        targetType: IClassifyable
    ): ITile[] {
        const finder = this.hitTilesFinder as HitTilesFinder;
        const selectorCbck = (other: IClassifyable) => (
            other.getGroupID() === targetType.getGroupID());
        return finder.collectItemsGroup([clickedCellCoords], 
            selectorCbck) as ITile[];
    }

    protected setupTask_DestroyHitTiles(): void {
        const task = new Task();
        this.hitTiles.forEach(tile => task
            .bundleWith(tile.destroyHitAsync()));
        this._hitTilesCrds = this.hitTiles
            .map(tileHit => tileHit.getCellCoordinates());
        this.taskMng.bundleWith(task, this.setupTask_OffsetLooseTiles);
        this.setupTask_UpdateScore();
    }   

    protected setupTask_OffsetLooseTiles = (): void => {
        const offsetter = this.tileOffsetter as TileOffsetter;
        const offset = offsetter.getTaskOffsetLooseTiles;
        const task = offset(this._hitTilesCrds);
        this.taskMng.bundleWith(task, this.onLooseTilesOffset);
    } 

    protected onLooseTilesOffset = () => {
        const finder = this.hitTilesFinder as HitTilesFinder;
        const empCellsInfo = finder.getEmptyCellsGroupedByColumn();
        const spawner = this.tileSpawner as TileSpawner;        
        empCellsInfo.forEach(infoItem => this
            .setupTask_SpawnNewTiles(infoItem, spawner));
        this.check4GameFinish();
    }

    protected setupTask_SpawnNewTiles = (
        demandInfo: Demand4NewTilesInfo,
        spawner: TileSpawner
    ): void => {
        if (!demandInfo.tiles2Spawn) return;
        const crds = this._updateDemand4TileInfo(demandInfo);
        const recursionCbck = () => this
            .setupTask_SpawnNewTiles(demandInfo, spawner);
        this.taskMng.bundleWith(spawner
            .spawnNewTile(crds, +this.height
        ), recursionCbck);
    }

    protected setupTask_UpdateScore(): void {
        console.error('Implement score update');
    }

    protected check4GameFinish(): void {
        console.error('Implement game finish');
    }

    private _replaceTileWithNewOne(
        newTile: ITile, col: number
    ): void {
        const colItems = this.gamefield[col];
        const lowestEmptyCell = colItems.find(tile => !tile.isValid);
        if (!lowestEmptyCell) throw 'Excessive tile spawned';
        const cellRow = colItems.indexOf(lowestEmptyCell);
        this.gamefield[col][cellRow] = newTile;
    }        
    
    private _updateDemand4TileInfo = (
        infoItem: Demand4NewTilesInfo
    ): GridCellCoordinates => {
        const { col, lowestRow: row } = infoItem;
        infoItem.tiles2Spawn--;
        infoItem.lowestRow++;
        return { row, col };
    }
}