
import { _decorator } from 'cc';
import { removeFromArray } from '../common/array-tools';
import { Task } from '../common/task';
import { TaskManager } from '../common/task-manager';
import { 
    BooleanGetter,
    StepResultByColsInfo, 
    ITile, 
    ITileSpawner, 
} from '../../types';
import { inject, injectable, injectValueByKey } from '../../decorators';
import { TileBase } from '../../controllers/tile-base';
import { CONFIG } from '../../config';

@injectable('TileAsyncRespawner')
export class TileAsyncRespawner {
    private _taskMngrs: TaskManager[] = [];   
    private _stepRslInfoByCol: StepResultByColsInfo;
    private _lastTilesByCol: Record<number, ITile | null>;
    private _penultRowY: number;

    @inject('ITileSpawner')
    private _spawner: ITileSpawner;
    @injectValueByKey('fieldHeight')
    private _height: number;

    respawnAsync(
        stepResultInfo: StepResultByColsInfo
    ): Task {
        this._taskMngrs = [];
        this._lastTilesByCol = {};
        this._stepRslInfoByCol = stepResultInfo;        

        const { colsIndex } = stepResultInfo;
        this._initRespawn();

        for (let i = 0; i < colsIndex.length; i++) 
            this._createColMng(+colsIndex[i]);
        return new Task().bundleWith(this._checkStatus.bind(this));
    }

    private _initRespawn(): void {
        const spawnerBaseCbck = this._spawner.onTileSpawn;
        this._spawner.onTileSpawn = tile => {
            spawnerBaseCbck?.(tile);
            this._lastTilesByCol[tile.сellCoordinates.col] = tile;
        };
        this._penultRowY = TileBase.getCellAbsPosition({
            row: this._height - CONFIG.TILES_FALL_SIZE_FR_DELAY,
            col: 0,
        }).y;        
    }

    private _createColMng(
        col: number
    ): void {
        const taskMng = TaskManager.create();
        this._taskMngrs.push(taskMng);
        this._setupTask_SpawnNewTiles4Col(col, taskMng);
    }

    private _checkStatus(): boolean {
        this._taskMngrs.forEach(mng => mng.isComplete());
        return !this._taskMngrs.length;
    }

    private _setupTask_SpawnNewTiles4Col(
        col: number,
        colTaskMng: TaskManager,
    ): void {
        const colInfo = this._stepRslInfoByCol.colsInfo[col];
        if (!colInfo.tiles2Spawn) {
            removeFromArray(this._taskMngrs, colTaskMng);
            return;
        }
        const row = this._height - colInfo.tiles2Spawn;
        this._lastTilesByCol[col] = null;
        const onTileSpawned = () => this
            ._setupTask_SpawnNewTiles4Col(col, colTaskMng);
        const passTopRow = this._hasTilePassedTopRow.bind(this);

        const spawnTileTask = this._spawner
            .spawnNewTile({ row, col }, this._height);     
        const fillColTask = colInfo.tiles2Spawn > 1 ?
            new Task().bundleWith(passTopRow(col)) :
            spawnTileTask;        

        colTaskMng.bundleWith(fillColTask, onTileSpawned);        
        colInfo.tiles2Spawn--;
    }

    private _hasTilePassedTopRow(
        col: number
    ): BooleanGetter {        
        return () => {
            const lastTile = this._lastTilesByCol[col];
            if (!lastTile) return false;
            return lastTile.node.position.y <= this._penultRowY;
        };
    }
}