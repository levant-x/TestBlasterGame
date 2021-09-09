
import { _decorator } from 'cc';
import { Task } from '../tools/common/task';
import { TileSpawner } from '../tools/tile-spawner';
import { 
    GridCellCoordinates, 
    IClassifyable, 
    ITile,
    LevelConfig, 
} from '../types';
import { GameplayBase } from './gameplay-base';
import { TileBase } from './tile-base';
import { TileAsyncRespawner } from './tile-async-respawner';
import { UI } from './ui/ui';
import { HitTilesFinder } from '../tools/hit-tiles-finder';
import { TileOffsetter } from '../tools/tile-offsetter';
import { Menu } from './ui/menu';
const { ccclass } = _decorator;

@ccclass('Gameplay')
export class Gameplay extends GameplayBase {  
    private _hitTilesCrds: GridCellCoordinates[] = [];
    private _asyncRespawner?: TileAsyncRespawner;
    private _gainPointsTask = new Task();

    async start() {
        await super.start();
        this._initProgress(this.uiMng as UI);
        this._asyncRespawner = new TileAsyncRespawner(
            this.tileSpawner as TileSpawner, 
            this.height,
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

    protected isStepValid (config: LevelConfig): boolean {
        const { length } = this.hitTiles;
        return length >= config.tilesetVolToDstr;
    }

    protected getHitTiles = (
        clickedCellCoords: GridCellCoordinates, 
        targetType: IClassifyable
    ): ITile[] => {
        const selectorCbck = (other: IClassifyable) => (
            other.getGroupID() === targetType.getGroupID());
        const finder = this.hitTilesFinder as HitTilesFinder;
        const collect = finder.collectItemsGroup;
        const hitTiles = collect([clickedCellCoords], selectorCbck);
        return hitTiles as ITile[];
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
        this.taskMng.bundleWith(
            respawner.respawnAsync(empCellsInfo)
        ).bundleWith(this._gainPointsTask, this.check4GameFinish);
    }

    protected setupTask_UpdateProgress(): void {
        const mng = this.uiMng as UI;
        const deltaPoints = this.hitTiles.length;
        this._gainPointsTask = mng.gainPoints(deltaPoints);
        this.updateStepsNum(mng);
    }

    protected updateStepsNum(uiMng: UI) {
        uiMng.stepsNum--;
    }

    protected check4GameFinish = (): void => {
        const cfg = this.cfg as LevelConfig;
        const uiMng = this.uiMng as UI;
        const hasWon = uiMng.getPoints() >= cfg.targetScore;
        if (hasWon) {
            const menu = this.menu as Menu;
            menu.show('win');
            return;
        }
        
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

    private _initProgress(mng: UI) {
        const cfg = this.cfg as LevelConfig;
        mng.stepsNum = cfg.stepsAvail;
        mng.reset();
    }
}