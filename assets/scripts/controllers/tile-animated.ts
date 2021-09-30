
import { _decorator, Vec3, tween } from 'cc';
import { CONFIG } from '../config';
import { BooleanGetter, GridCellCoordinates } from '../types';
import { TileBase } from './tile-base';
const { ccclass } = _decorator;

@ccclass('TileAnimated')
export class TileAnimated extends TileBase {
    private _hasMoveCompleted = false;
    private _gridNewCrds?: GridCellCoordinates;
    private _toFallInSpawn = true;

    update() {
        if (this._toFallInSpawn) this._toFallInSpawn = false;
    }

    public moveToCellAsync = (
        gridNewCoords: GridCellCoordinates,
        simultaneously = false,
    ): BooleanGetter => {
        this._hasMoveCompleted = false; 
        this._gridNewCrds = gridNewCoords;
        const cellAbsPosition = this.getCellAbsPosition(gridNewCoords);
        const durCfg = CONFIG.TILES_OFFSET_DURATION_SEC;
        const shufSpeedup = CONFIG.TILES_SHUFFLE_SPEEDUP;
        const moveDurBasic = simultaneously ? durCfg * shufSpeedup :
            (this.cellCoords.row - gridNewCoords.row) * durCfg;
        const moveDurFinite = this._toFallInSpawn ?
            moveDurBasic / CONFIG.TILES_1ST_FALL_SPEEDUP : moveDurBasic;
        this.setupMovement(cellAbsPosition, moveDurFinite);
        return () => this._hasMoveCompleted;
    }    

    protected setupMovement = (
        cellAbsPos: Vec3, 
        dur: number,
        toEaseInOnly: boolean = false,
    ): void => {
        tween(this.node)
            .to(dur, 
            { position: cellAbsPos }, 
            { easing: toEaseInOnly ? 'sineInOut' :'cubicIn' })
            .call(this._onMoveCompleted)
            .start();
    }

    private _onMoveCompleted = () => {
        this._hasMoveCompleted = true; 
        const newCrds = this._gridNewCrds as GridCellCoordinates;
        this.cellCoords = { ...newCrds };
        this._gridNewCrds = undefined;
    }
}