
import { _decorator, Vec3, tween, instantiate, Prefab, Animation } from 'cc';
import { CONFIG } from '../config';
import { TileAccessories } from '../controllers/tile-accessories';
import { Task } from '../tools/common/task';
import { TaskManager } from '../tools/common/task-manager';
import { BooleanGetter, GridCellCoordinates, ISupertile } from '../types';
import { TileBase } from './tile-base';
const { ccclass, property } = _decorator;

@ccclass('TileAnimated')
export class TileAnimated extends TileBase implements ISupertile {
    private _isSuper = false;    
    private _hasMoveCompleted = false;
    private _newPositionCoords?: GridCellCoordinates;
    private _taskMng?: TaskManager;

    get isSuper(): boolean {
        return this._isSuper;
    }

    @property(Prefab)
    shadowPr: Prefab;

    set isSuper(value: boolean) {
        this._isSuper = value;
        const shadow = instantiate(TileAccessories.get.supertileGlow);        
        this.node.addChild(shadow);  
    }

    moveToCellAsync(
        gridNewCoords: GridCellCoordinates,
        fixedTime = false,
    ): BooleanGetter {
        this._hasMoveCompleted = false; 
        this._newPositionCoords = gridNewCoords;

        const cellAbsPosition = TileBase.getCellAbsPosition(gridNewCoords);
        const moveDur = this._calcMoveDuration(fixedTime);        

        this.setupMovement(cellAbsPosition, moveDur);
        return () => this._hasMoveCompleted;
    }    

    destroyHitAsync(): BooleanGetter { 
        this._taskMng = TaskManager.create();       
        const setTask = this._taskMng.bundleWith.bind(this._taskMng);
        const disappearStatus = this._setupDestroyAnimation();

        setTask(new Task(disappearStatus), () => {
            setTask(new Task(super.destroyHitAsync()));
        });
        const destroyStatus = () => 
            this._taskMng ? this._taskMng.isComplete : true;
        return destroyStatus;
    }

    protected _calcMoveDuration(
        fixedTime: boolean
    ): number {
        const { row } = this.сellCoordinates;
        const moveSpeedCfg = CONFIG.TILES_MOVE_SPEED_UPS;
        const shuffleDurCfg = CONFIG.TILES_SHUFFLE_TIME_SEC;

        const targetPos = <GridCellCoordinates>this._newPositionCoords;
        const moveDur = fixedTime ? shuffleDurCfg : 
            (row - targetPos.row) / moveSpeedCfg;
        return moveDur;
    }

    protected setupMovement(
        cellAbsPosition: Vec3, 
        duration: number,
    ): void {
        const movement = tween(this.node)
            .to(duration, { 
                position: cellAbsPosition, }, { 
                easing: 'cubicIn', })
            .call(this._onMoveCompleted.bind(this));
        movement.start();
    }

    private _onMoveCompleted() {
        this._hasMoveCompleted = true; 
        const newCrds = <GridCellCoordinates>this._newPositionCoords;
        this.cellCrds = newCrds;
        this._newPositionCoords = undefined;
    }

    private _setupDestroyAnimation(): BooleanGetter {
        const animation = <Animation>this.getComponent(Animation);
        const clip = TileAccessories.get.destroyAnimation;

        animation.createState(clip);       
        animation.play(clip.name);

        const animState = animation.getState(clip.name);
        return () => !animState.isPlaying;
    }
}