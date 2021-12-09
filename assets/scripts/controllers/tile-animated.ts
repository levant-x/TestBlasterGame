
import { _decorator, Vec3, tween, Node, Prefab, instantiate } from 'cc';
import { CONFIG } from '../config';
import { BooleanGetter, GridCellCoordinates, ISupertile } from '../types';
import { TileBase } from './tile-base';
const { ccclass, property } = _decorator;

@ccclass('TileAnimated')
export class TileAnimated extends TileBase implements ISupertile {
    private _isSuper = false;    
    private _hasMoveCompleted = false;
    private _gridNewCrds?: GridCellCoordinates;

    @property(Prefab)
    protected superShadow: Node;

    get isSuper(): boolean {
        return this._isSuper;
    }

    set isSuper(value: boolean) {
        this._isSuper = value;
        const shadow = instantiate(this.superShadow);
        this.node.addChild(shadow);
    }

    moveToCellAsync(
        gridNewCoords: GridCellCoordinates,
        fixedTime = false,
    ): BooleanGetter {
        this._hasMoveCompleted = false; 
        this._gridNewCrds = gridNewCoords;

        const { row } = this.сellCoordinates;
        const cellAbsPosition = 
            TileBase.getCellAbsPosition(gridNewCoords);

        const speedCfg = CONFIG.TILES_MOVE_SPEED_UPS;
        const shfDur = CONFIG.TILES_SHUFFLE_TIME_SEC;

        const moveDur = fixedTime ? shfDur :
            (row - gridNewCoords.row) / speedCfg;

        this.setupMovement(cellAbsPosition, moveDur);
        return () => this._hasMoveCompleted;
    }    

    protected setupMovement(
        cellAbsPos: Vec3, 
        dur: number,
    ): void {
        tween(this.node)
            .to(dur, { 
                position: cellAbsPos }, { 
                easing: 'cubicIn',
            })
            .call(this._onMoveCompleted.bind(this))
            .start();
    }

    private _onMoveCompleted() {
        this._hasMoveCompleted = true; 
        const newCrds = <GridCellCoordinates>this._gridNewCrds;
        this.cellCrds = newCrds;
        this._gridNewCrds = undefined;
    }
}