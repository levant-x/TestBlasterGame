
import { _decorator, Vec3, tween, Sprite, Color } from 'cc';
import { CONFIG } from '../config';
import { BooleanGetter, GridCellCoordinates, ISupertile } from '../types';
import { TileBase } from './tile-base';
const { ccclass } = _decorator;

@ccclass('TileAnimated')
export class TileAnimated extends TileBase implements ISupertile {
    private _isSuper = false;    
    private _hasMoveCompleted = false;
    private _gridNewCrds?: GridCellCoordinates;

    get isSuper(): boolean {
        return this._isSuper;
    }

    set isSuper(value: boolean) {
        this._isSuper = value;
        const sprite = <Sprite>this.getComponent(Sprite);
        const { r, g, b, a } = sprite.color;
        sprite.color = new Color(r, g, b, a / 2);
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
        toEaseInOnly: boolean = false,
    ): void {
        tween(this.node)
            .to(dur, { 
                position: cellAbsPos }, { 
                easing: toEaseInOnly ? 'sineInOut' :'cubicIn'
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