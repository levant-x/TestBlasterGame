
import { _decorator } from 'cc';
import { removeFromArray } from '../tools/common/array-tools';
import { Task } from '../tools/common/task';
import { TaskManager } from '../tools/common/task-manager';
import { TileSpawner } from '../tools/tile-spawner';
import { Demand4NewTilesInfo, GridCellCoordinates } from '../types';

export class TileAsyncRespawner {
    private _taskMngrs: TaskManager[] = [];    
    private _spawner: TileSpawner;
    private _height: number;

    constructor(tileSpawner: TileSpawner, height: number) {
        this._spawner = tileSpawner;
        this._height = height;
    }
    
    public respawnAsync = (
        emptyCellsInfo: Demand4NewTilesInfo[]
    ): Task => {
        this._taskMngrs = [];
        emptyCellsInfo.forEach(this._createColMng);
        return new Task().bundleWith(this._checkStatus);
    }

    private _createColMng = (
        infoItem: Demand4NewTilesInfo
    ): void => {
        const taskMng = TaskManager.create();
        this._taskMngrs.push(taskMng);
        this._setupTask_SpawnNewTiles(infoItem, taskMng);
    }

    private _checkStatus = (): boolean => {
        this._taskMngrs.forEach(mng => mng.isComplete());
        return !this._taskMngrs.length;
    }

    private _setupTask_SpawnNewTiles = (
        demandInfo: Demand4NewTilesInfo,
        taskMng: TaskManager,
    ): void => {
        if (!demandInfo.tiles2Spawn) {
            removeFromArray(this._taskMngrs, taskMng);
            return;
        }
        const crds = this._updateDemand4TileInfo(demandInfo);
        const recursionCbck = () => this
            ._setupTask_SpawnNewTiles(demandInfo, taskMng);
        taskMng.bundleWith(this._spawner
            .spawnNewTile(crds, this._height
        ), recursionCbck);
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