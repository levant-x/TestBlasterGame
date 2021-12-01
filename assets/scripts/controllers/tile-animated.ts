
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
    private _toFallInSpawn = true;

    get isSuper(): boolean {
        return this._isSuper;
    }

    set isSuper(value: boolean) {
        this._isSuper = value;
        const sprite = <Sprite>this.getComponent(Sprite);
        const { r, g, b, a } = sprite.color;
        sprite.color = new Color(r, g, b, a / 2);
    }

    update() {
        if (this._toFallInSpawn) this._toFallInSpawn = false;
    }

    moveToCellAsync(
        gridNewCoords: GridCellCoordinates,
        simultaneously = false,
    ): BooleanGetter {
        this._hasMoveCompleted = false; 
        this._gridNewCrds = gridNewCoords;

        const { row } = this.сellCoordinates;
        const cellAbsPosition = 
            TileBase.getCellAbsPosition(gridNewCoords);

        const durCfg = CONFIG.TILES_OFFSET_DURATION_SEC;
        const shfSpdupFactor = CONFIG.TILES_SHUFFLE_SPEEDUP;

        const moveDurBasic = simultaneously ? durCfg / shfSpdupFactor : 
            (row - gridNewCoords.row) * durCfg;
        const moveDurFinite = this._toFallInSpawn ?
            moveDurBasic / CONFIG.TILES_1ST_FALL_SPEEDUP : moveDurBasic;

        this.setupMovement(cellAbsPosition, moveDurFinite);
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