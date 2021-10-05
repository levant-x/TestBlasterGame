
import { _decorator } from 'cc';
import { removeFromArray } from '../common/array-tools';
import { Task } from '../common/task';
import { TaskManager } from '../common/task-manager';
import { 
    Demand4NewTilesInfo, 
    GridCellCoordinates, 
    ITileSpawner 
} from '../../types';
import { inject, injectable, injectValueByKey } from '../../decorators';

@injectable()
export class TileAsyncRespawner {
    private _taskMngrs: TaskManager[] = [];   

    @inject('ITileSpawner')
    private _spawner: ITileSpawner;
    @injectValueByKey('fieldHeight')
    private _height: number;

    respawnAsync(
        emptyCellsInfo: Demand4NewTilesInfo[]
    ): Task {
        this._taskMngrs = [];
        emptyCellsInfo.forEach(this._createColMng.bind(this));
        return new Task().bundleWith(this._checkStatus.bind(this));
    }

    private _createColMng(
        infoItem: Demand4NewTilesInfo
    ): void {
        const taskMng = TaskManager.create();
        this._taskMngrs.push(taskMng);
        this._setupTask_SpawnNewTiles.bind(this)(infoItem, taskMng);
    }

    private _checkStatus(): boolean {
        this._taskMngrs.forEach(mng => mng.isComplete());
        return !this._taskMngrs.length;
    }

    private _setupTask_SpawnNewTiles(
        demandInfo: Demand4NewTilesInfo,
        taskMng: TaskManager,
    ): void {
        if (!demandInfo.tiles2Spawn) {
            removeFromArray(this._taskMngrs, taskMng);
            return;
        }
        const crds = this._updateDemand4TileInfo
            .bind(this)(demandInfo);
        const recursionCbck = () => this
            ._setupTask_SpawnNewTiles(demandInfo, taskMng);
            
        taskMng.bundleWith(this._spawner
            .spawnNewTile(crds, this._height
        ), recursionCbck);
    }
    
    private _updateDemand4TileInfo(
        infoItem: Demand4NewTilesInfo
    ): GridCellCoordinates {
        const { col, lowestRow: row } = infoItem;
        infoItem.tiles2Spawn--;
        infoItem.lowestRow++;
        return { row, col };
    }
}