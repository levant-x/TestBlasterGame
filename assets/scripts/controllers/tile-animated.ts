
import { _decorator, Vec3, tween } from 'cc';
import { TILES_1ST_FALL_SPEEDUP, TILES_OFFSET_DURATION_SEC } from '../config';
import { GridCellCoordinates } from '../types';
import { TileBase } from './tile-base';
const { ccclass } = _decorator;

@ccclass('Tile-animated')
export class TileAnimated extends TileBase {
    private _hasMoveCompleted = false;
    private _gridNewCrds?: GridCellCoordinates;
    private _toFallInSpawn = true;

    update() {
        if (this._toFallInSpawn) this._toFallInSpawn = false;
    }

    public moveToCellAsync = (
        gridNewCoords: GridCellCoordinates
    ) => {
        this._hasMoveCompleted = false; 
        this._gridNewCrds = gridNewCoords;
        const cellAbsPosition = this.getCellAbsPosition(gridNewCoords);
        const moveDurBasic = (this.cellCoords.row - gridNewCoords.row) * 
            TILES_OFFSET_DURATION_SEC;
        const moveDurFinite = this._toFallInSpawn ?
            moveDurBasic / TILES_1ST_FALL_SPEEDUP : moveDurBasic;
        this.setupMovement(cellAbsPosition, moveDurFinite);
        return () => this._hasMoveCompleted;
    }    

    protected setupMovement = (
        cellAbsPos: Vec3, dur: number
    ) => {
        tween(this.node)
            .to(dur, 
            { position: cellAbsPos }, 
            { easing: 'cubicIn' })
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