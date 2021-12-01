
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
    private _penultRowY: number;

    @inject('ITileSpawner')
    private _spawner: ITileSpawner;
    @injectValueByKey('fieldHeight')
    private _height: number;

    respawnAsync(
        stepResultInfo: StepResultByColsInfo
    ): Task {
        this._taskMngrs = [];
        this._stepRslInfoByCol = stepResultInfo;        

        const { colsIndex } = stepResultInfo;

        for (let i = 0; i < colsIndex.length; i++) 
            this._createColMng(+colsIndex[i]);
        return new Task().bundleWith(this._checkStatus.bind(this));
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
        const { tiles2Spawn } = this._stepRslInfoByCol.colsInfo[col];
        for (let i = tiles2Spawn; i > 0 ; i--) {
            
            const row = this._height - i;
            const spawnTileTask = this._spawner
                .spawnNewTile({ row, col }, this._height, tiles2Spawn - i);  

            colTaskMng.bundleWith(spawnTileTask, 
                () => removeFromArray(this._taskMngrs, colTaskMng)
            );        
        }
    }
}