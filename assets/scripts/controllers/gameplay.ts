
import { Node, _decorator } from 'cc';
import { HitTilesFinder } from '../tools/hit-tiles-finder';
import { Task } from '../tools/common/task';
import { TileOffsetter } from '../tools/tile-offsetter';
import { TileSpawner } from '../tools/tile-spawner';
import { 
    GridCellCoordinates, 
    IClassifyable, 
    IScore, 
    ITile,
    LevelConfig, 
} from '../types';
import { GameplayBase } from './gameplay-base';
import { TileBase } from './tile-base';
import { TileAsyncRespawner } from './tile-async-respawner';
import { UI } from './ui';
const { ccclass, property } = _decorator;

@ccclass('Gameplay')
export class Gameplay extends GameplayBase {  
    private _hitTilesCrds: GridCellCoordinates[] = [];
    private _asyncRespawner?: TileAsyncRespawner;
    private _uiMng?: IScore;

    @property(Node)
    uiNode?: Node;

    async start() {
        await super.start();
        this._uiMng = this.uiNode?.getComponent(UI) as IScore;
        this._asyncRespawner = new TileAsyncRespawner(
            this.tileSpawner as TileSpawner, 
            this.height
        );
    }
    
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
        this.setupTask_UpdateProgress();
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
        const respawner = this._asyncRespawner as TileAsyncRespawner;        
        this.taskMng.bundleWith(respawner.respawnAsync(empCellsInfo));
        this.check4GameFinish();
    }

    protected setupTask_UpdateProgress(): void {
        const deltaPoints = this.hitTiles.length;
        const mng = this._uiMng as IScore;
        this.taskMng.bundleWith(mng.gainPoints(deltaPoints));
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
}